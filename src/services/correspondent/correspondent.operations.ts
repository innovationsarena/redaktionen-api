import { FlowInput, Signals, Summaries } from "../../core";
import { correspondentQueue } from "./correspondent.worker";

export const runCorrespondents = async (
  agencyId: string,
  context: FlowInput
): Promise<void> => {
  console.log("Running correspondents...");

  // Empty summaries for agency
  await Summaries.empty(agencyId);

  const signalsList = await Signals.list({ agencyId });

  for await (const signal of signalsList) {
    await correspondentQueue.add("correspondent.summary", {
      agencyId,
      signal,
      context,
    });
  }
};
