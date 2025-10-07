import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey } from "../core";
import { createWorkflow } from "../controllers";

export const workflowRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/workflows",
    {
      config: {
        description: "Creates a new workflow.",
      },
      preValidation: [],
      preHandler: [],
    },
    createWorkflow as unknown as RouteHandlerMethod
  );
};
