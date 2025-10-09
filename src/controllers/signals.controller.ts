import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { signals } from "../services";

export const listSignals = asyncHandler(
  async (
    request: FastifyRequest<{ Querystring: { factor?: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { factor } = request.query;

    const Signals = await signals.list(factor);

    return reply.status(200).send(Signals);
  }
);

export const getSignal = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { signalId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { signalId } = request.params;

    const signal = await signals.get(signalId);

    return reply.status(200).send(signal);
  }
);
