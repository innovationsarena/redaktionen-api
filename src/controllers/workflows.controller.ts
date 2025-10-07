import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { pestelWorkflow } from "../workflows/pestel.workflow";

export const createWorkflow = asyncHandler(
  async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const LIMIT = 5;
    const signals = await pestelWorkflow(LIMIT);
    return reply.status(201).send({
      signals,
    });
  }
);
