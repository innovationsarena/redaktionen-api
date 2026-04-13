import { tipster } from ".";
import { Context, Signal, Signals } from "../../core";

export const runTipsters = async (
  agencyId: string,
  context: Context
): Promise<Signal[]> => {
  const { factors, tipLimit } = context;

  console.log("Running tipsters...");

  // Empty tipster jar for agency
  await Signals.empty(agencyId);

  let allSignals: Signal[] = [];

  for await (const factor of factors) {
    allSignals = [
      ...allSignals,
      ...(await tipster(agencyId, factor, tipLimit)),
    ];
  }

  return allSignals;
};
