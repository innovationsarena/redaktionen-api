import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { Summaries } from "../services";

export const listSummariesController = asyncHandler(
  async (
    request: FastifyRequest<{ Querystring: { factor: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { factor } = request.query;

    const summaries = await Summaries.list(factor);

    return reply.status(200).send(summaries);
  }
);

export const getSummaryController = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { summary: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const summary = await Summaries.get(request.params.summary);

    return reply.status(200).send(summary);
  }
);
