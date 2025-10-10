import { tipster } from "../agents";
import { Signal, WorkflowInput } from "../core";
import { emptySignals, emptySummaries } from "../services";
import { correspondentWorkflow } from "./correspondent.workflow";

export const pestelWorkflow = async (
  context: WorkflowInput
): Promise<Signal[]> => {
  // Run Tipsters

  const { factors, tipLimit: LIMIT } = context;

  // Empty tipster jar
  await emptySignals();

  let allSignals: Signal[] = [];

  for await (const factor of factors) {
    allSignals = [...allSignals, ...(await tipster(factor, LIMIT))];
  }

  console.log(`---------------------------------------`);
  console.log(`>>> Total ${allSignals.length} signals fetched. <<<`);
  console.log(`---------------------------------------`);

  await emptySummaries();
  await correspondentWorkflow(context);

  return allSignals;
};
