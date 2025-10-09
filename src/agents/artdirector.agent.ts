import {
  generateObject,
  experimental_generateImage as generateImage,
} from "ai";
import { Summary } from "../core";
import { openai } from "@ai-sdk/openai";
import { summaries, supabase } from "../services";
import z from "zod";
import sharp from "sharp";

export const artDirector = async (
  summary: Summary,
  style?: string
): Promise<void> => {
  console.log(
    `Art director creating poster image to ${summary.title} summary.`
  );
  console.log(summary);
  const system = `You are an image-generation assistant. For each user input , extract 2-3 concise symbolic keywords and produce a single short photorealistic poster prompt. Output only the final prompt (one line), do not add explanations.

Prompt requirements:
- Style: Photorealistic, vibrant pastel palette.
- Subject: symbolic objects or situations representing the given summary arranged in a creative way
- People: No human faces or identifiable people.
- No logos, no on-image text.
- Lighting/composition: Soft natural lighting, high detail, shallow depth of field, cinematic composition.
- Orientation: Horizontal poster (16:9 aspect ratio).

Output: 
The output should be a complete prompt that will be directly prompted to an image model.
`;

  const prompt = `Create a poster image that represents this article: 
  title: ${summary.title}
  body: ${summary.body}`;

  try {
    // Art prompt
    const { object } = await generateObject({
      model: openai(
        (process.env.ARTDIRECTOR_DEFAULT_MODEL as string) || "gpt-5-mini"
      ),
      system,
      prompt,
      schema: z.object({ imagePrompt: z.string() }),
    });

    console.log(object);

    // Create Image
    const { image } = await generateImage({
      model: openai.image(
        (process.env.DEFAULT_IMAGE_MODEL as string) || "gpt-image-1-mini"
      ),
      prompt: object.imagePrompt,
    });

    // Store Image
    const url = await createImageFromBase64(image.base64);

    // Update summary with public URL
    await summaries.update({ ...summary, posterUrl: url });

    return;
  } catch (error) {
    console.log(error);
  }
};

async function createImageFromBase64(base64: string): Promise<string> {
  const imgBuffer = Buffer.from(base64, "base64");

  // Convert to JPG with sharp
  const jpgBuffer = await sharp(imgBuffer)
    .resize(1024, null)
    .toFormat("jpg", { quality: 60 })
    .toBuffer();

  // Generate unique filename
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}.jpg`;

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, jpgBuffer, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(`Failed to upload image: ${error.message}`);

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
