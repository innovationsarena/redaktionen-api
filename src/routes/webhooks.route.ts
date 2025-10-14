import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateWebhook } from "../core";
import { handleWebhookController } from "../controllers";

export const webhooksRouter = (fastify: FastifyInstance) => {
  fastify.post(
    "/webhooks",
    {
      preValidation: [validateWebhook],
    },
    handleWebhookController as unknown as RouteHandlerMethod
  );
};
