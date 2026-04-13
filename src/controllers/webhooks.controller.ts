import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";

export const handleWebhookController = asyncHandler(
  async (
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    return reply.status(200).send({ message: "Webhook triggered." });
  }
);
