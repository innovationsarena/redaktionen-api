import { FastifyRequest } from "fastify";
import { tipster } from ".";
import { AgencyContext, FlowInput, Signal, Signals } from "../../core";

export const runTipsters = async (
  request: FastifyRequest,
  context: FlowInput
): Promise<Signal[]> => {
  const { agency } = request;
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
