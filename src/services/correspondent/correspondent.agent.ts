import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  AgencyContext,
  FlowInput,
  Signal,
  Summaries,
  Summary,
  SummaryInputSchema,
} from "../../core";

export const correspondent = async (
  agency: AgencyContext,
  flowSettings: FlowInput,
  signal: Signal
): Promise<Summary | any> => {
  console.log(
    `${signal.factor} correspondent on the case summarizing >>> ${signal.sourceUrl} <<< for agency ${agency.name}.`
  );

  const resp = await fetch(signal.sourceUrl);
  const rawHTML = await resp.text();

  const system = `
  You are given a HTML code. I want to you collect the information on it and write a summaried article with title and body text in swedish. The summary should be short and clear without loosing any vital information. Set a scope key (global, eu, sweden) depending on the scope of the article. Make sure the title or body doesnt include any backticks.`;
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
      agency: agency.id,
    };

    Summaries.write(summary);

    return summary;
  } catch (error) {
    console.log(error);
    // Handle error
    return;
  }
};
