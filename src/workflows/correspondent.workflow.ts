import { WorkflowInput } from "../core";
import { correspondentQueue, signals } from "../services";

export const correspondentWorkflow = async (
  context: WorkflowInput
): Promise<void> => {
  const signalsList = await signals.list();
  for await (const signal of signalsList) {
    await correspondentQueue.add("correspondent.summerize", {
      signal,
      context,
    });
  }
  return;
};
