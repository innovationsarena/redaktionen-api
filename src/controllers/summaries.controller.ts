import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { summaries } from "../services";

export const listSummariesController = asyncHandler(
  async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const Summaries = await summaries.list();

    return reply.status(200).send(Summaries);
  }
);

export const getSummaryController = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { summary: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const summary = await summaries.get(request.params.summary);

    return reply.status(200).send(summary);
  }
);
