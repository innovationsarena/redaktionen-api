import { WorkflowInput } from "../core";
import { correspondentQueue, Signals } from "../services";

export const correspondentWorkflow = async (
  agencyId: string,
  context: WorkflowInput
): Promise<void> => {
  const signalsList = await Signals.list({ agencyId });

  for await (const signal of signalsList) {
    await correspondentQueue.add("correspondent.summerize", {
      agencyId,
      signal,
      context,
    });
  }
  return;
};
