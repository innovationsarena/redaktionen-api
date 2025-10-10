import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { Signals } from "../services";

export const listSignals = asyncHandler(
  async (
    request: FastifyRequest<{ Querystring: { factor?: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { factor } = request.query;

    const signals = await Signals.list(factor);

    return reply.status(200).send(signals);
  }
);

export const getSignal = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { signalId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { signalId } = request.params;

    const signal = await Signals.get(signalId);

    return reply.status(200).send(signal);
  }
);
