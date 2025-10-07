import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { tipsterQueue } from "../services";

export const createWorkflow = asyncHandler(
  async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    tipsterQueue.add("tipster.start", { limit: 1 });

    return reply.status(200).send({
      message: "Workflow started.",
    });
  }
);
