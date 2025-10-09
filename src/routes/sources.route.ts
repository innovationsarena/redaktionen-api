import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { getSignal, listSignals } from "../controllers";
import { validateKey } from "../core";

export const sourcesRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/sources",
    {
      preValidation: [validateKey],
    },
    listSignals as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/sources/:sourceId",
    {
      preValidation: [validateKey],
    },
    getSignal as unknown as RouteHandlerMethod
  );
};
