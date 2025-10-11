import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { Summaries } from "../services";

export const listSummariesController = asyncHandler(
  async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const summaries = await Summaries.list();

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
