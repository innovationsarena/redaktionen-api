import { correspondentQueue, signals } from "../services";

export const correspondentWorkflow = async (): Promise<void> => {
  const signalsList = await signals.list();
  console.log(signalsList.length);
  for await (const signal of signalsList) {
    await correspondentQueue.add("correspondent.start", signal);
  }
};

export const runCorrespondentWorkflow = async (): Promise<void> => {
  const Signals = await signals.list();
  for await (const signal of Signals) {
    await correspondentQueue.add("correspondent.start", signal);
  }
  return;
};
