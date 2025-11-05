import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { Sources } from "../services";

export const listSources = asyncHandler(
  async (
    request: FastifyRequest<{
      Querystring: { factor?: string };
    }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { factor } = request.query;

    const sources = await Sources.list(factor);

    return reply.status(200).send(sources);
  }
);

export const getSource = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { sourceId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { sourceId } = request.params;

    const source = await Sources.get(sourceId);

    return reply.status(200).send(source);
  }
);

export const deleteSource = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { sourceId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { sourceId } = request.params;

    const source = await Sources.delete(sourceId);

    return reply.status(200).send(source);
  }
);
