import { tipster } from ".";
import { AgencyContext, FlowInput, Signal, Signals } from "../../core";

export const runTipsters = async (
  agency: AgencyContext,
  flowSettings: FlowInput
): Promise<Signal[]> => {
  const { factors, tipLimit } = flowSettings;
  const { id: agencyId } = agency;

  // Empty tipster jar for agency
  await Signals.empty(agencyId);

  let allSignals: Signal[] = [];

  for await (const factor of factors) {
    allSignals = [...allSignals, ...(await tipster(agency, factor, tipLimit))];
  }

  return allSignals;
};
