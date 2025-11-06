import { Agents, Reports, Summaries, supabase } from "../services";
import { Summary, Report, Agent } from "../core";
import { openai } from "@ai-sdk/openai";
import sharp from "sharp";
import z from "zod";
import {
  generateObject,
  experimental_generateImage as generateImage,
} from "ai";

export const artDirector = async (
  content: any, // Summary | Report | Agent
  type: "summary" | "report" | "agent"
): Promise<void> => {
  let system = `
  You are an image-generation assistant. For each user input , extract 2-3 concise symbolic keywords and produce a single short photorealistic poster prompt. Output only the final prompt (one line), do not add explanations.

  ## Prompt requirements
  - Style: Photorealistic, vibrant pastel palette.
  - Subject: symbolic objects or situations representing the given summary arranged in a creative way
  - People: No human faces or identifiable people.
  - No logos, no on-image text.
  - Lighting/composition: Soft natural lighting, high detail, shallow depth of field, cinematic composition.
  - Orientation: Horizontal poster (16:9 aspect ratio).

  ## Output
  The output should be a complete prompt that will be directly prompted to an image model.
`;

  let prompt = `Create an image.`;

  if (type === "summary") {
    prompt = `Create a poster image that represents this article: 
      title: ${content.title}
      body: ${content.body}`;
  }

  if (type === "report") {
    prompt = `Create a poster image that represents this article: 
      title: ${content.title}
      body: ${content.body}`;
  }
  if (type === "agent") {
    system = `
      You are an image-generation assistant. 

      ## Instructions
      - hotorealistic professional headshot of the given description
      - close-up on head, direct eye contact, confident and approachable, the eyes must be in complete vertical middle of the image
      - tidy grooming, attire appropriate for given description
      - soft studio lighting, shallow depth of field, neutral background
      - natural colors, high detail, 1:1 portrait, no text
    `;
    prompt = `Create a portrait image that represents this description: ${content.description}`;
  }

  console.log(`Art director creating poster image type: ${type}.`);

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

    const size: number[] = type === "agent" ? [1024, 1024] : [1536, 1024];

    // Create Image
    const { image } = await generateImage({
      model: openai.image(
        (process.env.DEFAULT_IMAGE_MODEL as string) || "gpt-image-1-mini"
      ),
      prompt: object.imagePrompt,
      size: `${size[0]}x${size[1]}`,
    });

    // Store Image
    const url = await createImageFromBase64(image.base64, type);

    if (type === "summary") {
      // Update summary with public URL
      await Summaries.update({ ...(content as Summary), posterUrl: url });
    }

    if (type === "report") {
      // Update report with public URL
      await Reports.update({ ...(content as Report), posterUrl: url });
    }

    if (type === "agent") {
      // Update report with public URL
      await Agents.update({ ...(content as Agent), avatarUrl: url });
    }

    return;
  } catch (error) {
    console.log(error);
  }
};

async function createImageFromBase64(
  base64: string,
  type: string
): Promise<string> {
  const imgBuffer = Buffer.from(base64, "base64");

  let size = 1024;

  if (type === "agent") {
    size = 512;
  }

  // Convert to JPG with sharp
  const jpgBuffer = await sharp(imgBuffer)
    .resize(size, null)
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
