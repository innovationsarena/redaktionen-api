import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { signals, sources } from "../services";

export const listSources = asyncHandler(
  async (
    request: FastifyRequest<{
      Querystring: { organizationId?: string; factor?: string };
    }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { organizationId, factor } = request.query;

    if (!organizationId)
      return reply.status(400).send("Organization Id not found");

    const Sources = await sources.list(organizationId, factor);

    return reply.status(200).send(Sources);
  }
);

export const getSource = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { sourceId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { sourceId } = request.params;

    const source = await sources.get(sourceId);

    return reply.status(200).send(source);
  }
);
