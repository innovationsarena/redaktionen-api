import { AgencyContext, FlowInput, Signals, Summaries } from "../../core";
import { correspondentQueue } from "./correspondent.worker";

export const runCorrespondents = async (
  agency: AgencyContext,
  flowSettings: FlowInput
): Promise<void> => {
  const { id: agencyId } = agency;

  // Empty summaries for agency
  await Summaries.empty(agencyId);

  const signalsList = await Signals.list({ agencyId });

  for await (const signal of signalsList) {
    await correspondentQueue.add("correspondent.summary", {
      agency,
      flowSettings,
      signal,
    });
  }

  return;
};
