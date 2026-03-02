import { Agents, Reports, Summaries, supabase } from "../../core";
import { Summary, Report, Agent } from "../../core";
import { openai } from "@ai-sdk/openai";
import sharp from "sharp";
import z from "zod";
import {
  generateObject,
  experimental_generateImage as generateImage,
} from "ai";

export const artDirector = async (
  agencyId: string,
  content: Summary | Report | Agent, // Summary | Report | Agent
  type: "summary" | "report" | "agent"
): Promise<void> => {
  console.log(`Art director creating image type: ${type}.`);

  let styleRef = `Create a hyper-realistic photograph.

This must look like a real photo taken with a physical camera.
NOT an illustration.
NOT digital art.
NOT CGI.
NOT 3D render.
NOT concept art.
NOT stylized drawing.

The image should be indistinguishable from professional editorial photography.

Camera & optics:
- Shot on a real analog full-frame camera with Kodachrome film
- 50mm lens
- Realistic depth of field (not infinite sharpness)
- Natural lens imperfections, micro blur, slight chromatic aberration
- Subtle high-resolution film grain

Lighting:
- Real-world soft lighting only
- Natural light or practical lights
- Physically correct shadows and reflections
- No flat illustration lighting
- No glowing edges, no haloing

Materials & realism:
- Physically accurate skin texture, pores, wrinkles
- Real fabric fibers, seams, folds
- Real wood grain, metal imperfections, dust
- Imperfect symmetry (human-made, not mathematically perfect)

Composition & style:
- Centered, symmetrical framing inspired by auteur cinema
- Looks like a real film still from a live-action movie
- Carefully staged production design, but entirely photographic
- Everything must obey real-world physics and optics

Color:
- Muted pastel tones with warm natural color response
- Filmic color grading, matte finish
- No painted surfaces, no poster colors

Mood:
- Calm, slightly melancholic, restrained
- Subtle and grounded, not whimsical or illustrative

Hard negative constraints:
- No illustration
- No digital art
- No cartoon style
- No painting
- No vector graphics
- No unreal textures
- No perfectly flat surfaces
- No artificial symmetry
- No storybook or fantasy look

Final requirement:
If this image would not be accepted as a real photograph by a professional photo editor, it is wrong.
`;

  let system = `You are an expert visual storyteller. You will receive an article about a real, current event. Identify one short, powerful moment that captures the core meaning and emotional truth of the story. Describe this moment as a vivid, cinematic visual scene in 5-7 sentences, using concrete details, atmosphere, and human presence but aviod faces and indetifiable persons if possible. The scene should clearly summarize what the article is about without explaining it directly.`;
  let prompt = `Create a poster image.`;

  if (type === "summary") {
    prompt = `Create a poster image that represents this article:
      title: ${(content as Summary).title}
      body: ${(content as Summary).body}`;
  }

  if (type === "report") {
    prompt = `Create a poster image that represents this article:
 title: ${(content as Report).title}
      body: ${(content as Report).body}`;
  }

  if (type === "agent") {
    system = `
      You are an image-generation assistant.

      ## Instructions
      - photorealistic professional headshot of the given description
      - close-up on head, direct eye contact, confident and approachable, the eyes must be in complete vertical middle of the image
      - tidy grooming, attire appropriate for given description
      - soft studio lighting, shallow depth of field, neutral background
      - natural colors, high detail, 1:1 portrait, no text
    `;

    prompt = `Create a portrait image that represents this description: ${
      (content as Agent).description
    }`;
  }

  try {
    // Art prompt
    const { object } = await generateObject({
      model: openai(
        (process.env.ARTDIRECTOR_DEFAULT_MODEL as string) || "gpt-5-mini"
      ),
      system,
      prompt,
      schema: z.object({ motivePrompt: z.string() }),
    });

    const size: number[] = type === "agent" ? [1024, 1024] : [1536, 1024];

    // Create Image
    const { image } = await generateImage({
      model: openai.image(
        (process.env.DEFAULT_IMAGE_MODEL as string) || "gpt-image-1.5"
      ),
      prompt: `Create an image from following instructions: \n\n # Style reference \n${styleRef} \n\n# Motive \n ${object.motivePrompt}`,
      size: `${size[0]}x${size[1]}`,
    });

    // Store Image
    const url = await createImageFromBase64(image.base64, type, agencyId);
    console.log(url);

    if (type === "summary") {
      // Update summary with public URL
      await Summaries.update({ ...(content as Summary), posterUrl: url });
    }

    if (type === "report") {
      // Update report with public URL
      await Reports.update({ ...(content as Report), posterUrl: url });
    }

    if (type === "agent") {
      // Update agent with public URL
      await Agents.update({ ...(content as Agent), avatarUrl: url });
    }

    return;
  } catch (error) {
    console.log(error);
  }
};

async function createImageFromBase64(
  base64: string,
  type: string,
  agencyId: string
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
  const fileName = `${agencyId}-${Date.now()}-${Math.random()
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
