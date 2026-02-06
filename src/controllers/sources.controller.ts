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
    const agencyId = request.agency?.id;

    const sources = await Sources.list({ factor, agencyId });

    return reply.status(200).send(sources);
  }
);

export const getSource = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { sourceId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { sourceId } = request.params;
    const agencyId = request.agency?.id;

    const source = await Sources.get(sourceId, agencyId);

    return reply.status(200).send(source);
  }
);

export const createSource = asyncHandler(
  async (
    request: FastifyRequest<{ Body: SourceInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    // Agency key: use authenticated agency's ID
    // Admin key: must provide agency in body
    if (!request.agency && !request.body.agency) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "agency is required when using admin key",
        statusCode: 400,
      });
    }

    const agencyId = request.agency?.id ?? request.body.agency;

    const source = await Sources.write({
      ...request.body,
      agency: agencyId,
    });

    return reply.status(200).send(source);
  }
);

export const deleteSource = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { sourceId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { sourceId } = request.params;
    const agencyId = request.agency?.id;

    const source = await Sources.delete(sourceId, agencyId);

    return reply.status(200).send(source);
  }
);
