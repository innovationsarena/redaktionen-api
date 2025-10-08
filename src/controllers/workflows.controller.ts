import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { tipsterQueue } from "../services";

export const createWorkflow = asyncHandler(
  async (
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { limit } = request.query;

    tipsterQueue.add("tipster.start", { limit: 1 });

    return reply.status(200).send({
      message: "Workflow started.",
    });
  }
);
