import { WorkflowInput } from "../core";
import { correspondentQueue, Signals } from "../services";

export const correspondentWorkflow = async (
  context: WorkflowInput
): Promise<void> => {
  const signalsList = await Signals.list();
  for await (const signal of signalsList) {
    await correspondentQueue.add("correspondent.summerize", {
      signal,
      context,
    });
  }
  return;
};
