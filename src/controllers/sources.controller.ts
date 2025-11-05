import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler, SourceInput } from "../core";
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

export const createSource = asyncHandler(
  async (
    request: FastifyRequest<{ Body: SourceInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const source = await Sources.write(request.body);

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
