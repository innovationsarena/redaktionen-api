import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey } from "../core";
import { listSignals } from "../controllers/signals.controller";

export const signalsRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/signals",
    {
      preValidation: [validateKey],
    },
    listSignals as unknown as RouteHandlerMethod
  );
};
