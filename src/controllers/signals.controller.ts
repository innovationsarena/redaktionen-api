import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { Signals } from "../services";

export const listSignals = asyncHandler(
  async (
    request: FastifyRequest<{ Querystring: { factor?: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { factor } = request.query;
    const agencyId = request.agency?.id;

    const signals = await Signals.list({ factor, agencyId });

    return reply.status(200).send(signals);
  }
);

export const getSignal = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { signalId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { signalId } = request.params;
    const agencyId = request.agency?.id;

    const signal = await Signals.get(signalId, agencyId);

    return reply.status(200).send(signal);
  }
);
