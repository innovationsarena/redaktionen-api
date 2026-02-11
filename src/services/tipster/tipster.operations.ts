import { tipster } from ".";
import { AgencyContext, FlowInput, Signal, Signals } from "../../core";

export const runTipsters = async (
  agency: AgencyContext,
  context: FlowInput
): Promise<Signal[]> => {
  const { factors, tipLimit } = context;

  // Empty tipster jar for agency
  await Signals.empty(agency?.id as string);

  let allSignals: Signal[] = [];

  for await (const factor of factors) {
    allSignals = [
      ...allSignals,
      ...(await tipster(agency as AgencyContext, factor, tipLimit)),
    ];
  }

  return allSignals;
};
