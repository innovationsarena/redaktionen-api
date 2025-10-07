import { tipster } from "../agents";
import { Signal } from "../core";
import { emptySignals } from "../services";
import { runCorrespondentWorkflow } from "./correspondent.workflow";

export const pestelWorkflow = async (limit: number): Promise<Signal[]> => {
  // Run Tipsters

  const LIMIT = limit;

  // Empty tipster jar
  await emptySignals();

  const politicalSignals = await tipster("political", LIMIT);
  const economicSignals = await tipster("economic", LIMIT);
  const socialSignals = await tipster("social", LIMIT);
  const technologicalSignals = await tipster("technological", LIMIT);
  const legalSignals = await tipster("legal", LIMIT);
  const environmentalSignals = await tipster("environmental", LIMIT);

  const allSignals = [
    ...politicalSignals,
    ...economicSignals,
    ...socialSignals,
    ...technologicalSignals,
    ...legalSignals,
    ...environmentalSignals,
  ];

  console.log(`---------------------------------------`);
  console.log(`>>> Total ${allSignals.length} signals fetched. <<<`);
  console.log(`---------------------------------------`);

  await runCorrespondentWorkflow();

  return allSignals;
};
