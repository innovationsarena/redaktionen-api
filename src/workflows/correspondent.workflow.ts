import { correspondentQueue, signals } from "../services";

export const correspondentWorkflow = async (): Promise<void> => {
  const signalsList = await signals.list();
  for await (const signal of signalsList) {
    await correspondentQueue.add("correspondent.start", signal);
  }
  return;
};
