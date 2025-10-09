import { generateObject } from "ai";
import { Signal, Summary, SummaryInputSchema } from "../core";
import { openai } from "@ai-sdk/openai";

export const correspondent = async (
  signal: Signal,
  filter?: string
): Promise<Summary | void> => {
  console.log(
    `${signal.factor} correspondent on the case summarizing >>> ${signal.sourceUrl} <<<.`
  );

  const resp = await fetch(signal.sourceUrl);
  const rawHTML = await resp.text();

  const system = `
  You are given a HTML code. I want to you collect the information on it and write a summaried article with title and body text in swedish. The summary should be short and clear without loosing any vital information. ${
    filter ? filter : ""
  }`;
  try {
    const { object } = await generateObject({
      model: openai(process.env.CORRESPONDENT_DEFAULT_MODEL as string),
      system,
      prompt: rawHTML.substring(0, 300000),
      schema: SummaryInputSchema,
    });

    const summary = {
      ...object,
      signalId: signal?.id as number,
      posterUrl: null,
      date: signal.date,
      factor: signal.factor,
      sourceUrl: signal.sourceUrl,
    };

    return summary;
  } catch (error) {
    console.log(error);
  }
};
