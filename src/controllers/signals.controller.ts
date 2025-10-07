import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { signals } from "../services";

export const listSignals = asyncHandler(
  async (
    request: FastifyRequest<{ Querystring: { factor?: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { factor } = request.query;

    const f = factor ? factor : undefined;

    const items = await signals.list(f);

    return reply.status(200).send({
      signals: items,
    });
  }
);
