import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler, WorkflowInput } from "../core";
import { tipsterQueue } from "../services";

export const createWorkflow = asyncHandler(
  async (
    request: FastifyRequest<{ Body: WorkflowInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    tipsterQueue.add("tipster.start", request.body);

    return reply.status(200).send({
      message: `Workflow '${request.body.name}' started.`,
    });
  }
);
