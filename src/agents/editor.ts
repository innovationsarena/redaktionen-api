import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import z from "zod";

export const editor = async () => {
  const prompt = "You are a editor.";

  const { object } = await generateObject({
    model: openai(process.env.EDITOR_DEFAULT_MODEL as string),
    prompt,
    schema: z.object({}),
  });

  return object;
};
