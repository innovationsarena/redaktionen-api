import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey } from "../core";
import { listSignals } from "../controllers/signals.controller";

export const signalsRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/signals",
    {
      config: {
        description: "List signals.",
      },
      preValidation: [],
      preHandler: [],
    },
    listSignals as unknown as RouteHandlerMethod
  );
};
