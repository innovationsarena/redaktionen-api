import { FastifyRequest } from "fastify";
import { FlowInput, Signals, Summaries } from "../../core";
import { correspondentQueue } from "./correspondent.worker";

export const runCorrespondents = async (
  request: FastifyRequest,
  context: FlowInput
): Promise<void> => {
  const { agency } = request;
  const agencyId = agency?.id as string;

  // Empty summaries for agency
  await Summaries.empty(agencyId);

  const signalsList = await Signals.list({ agencyId });

  for await (const signal of signalsList) {
    await correspondentQueue.add("correspondent.summary", {
      agencyId,
      signal,
      context,
    });
  }
};
