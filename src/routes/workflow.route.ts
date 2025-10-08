import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey } from "../core";
import { createWorkflow } from "../controllers";

export const workflowRouter = (fastify: FastifyInstance) => {
  fastify.post(
    "/workflows",
    {
      preValidation: [validateKey],
    },
    createWorkflow as unknown as RouteHandlerMethod
  );
};
