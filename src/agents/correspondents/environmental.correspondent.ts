import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { Signal } from "../../core";
import z from "zod";

export const environmentalCorrespondent = async (signals: Signal[]) => {
  const summaries: { title: string; body: string; factor: string }[] = [];
  const factor = "environmental";
  const filter = "From the signals you get, take this perspective...";

  for await (const signal of signals) {
    const resp = await fetch(signal.sourceUrl);
    const rawHTML = await resp.text();

    const prompt = `You are given a HTML code. I want to you collect the information on it and write a summaried article with title and body text. The HTML: ${rawHTML}`;

    const { object } = await generateObject({
      model: openai(process.env.CORRESPONDENT_DEFAULT_MODEL as string),
      prompt,
      schema: z.object({
        title: z.string(),
        body: z.string(),
      }),
    });

    summaries.push({ ...object, factor });
  }

  return summaries;
};
