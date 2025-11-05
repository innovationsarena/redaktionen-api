import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey } from "../core";
import { deleteSource, getSource, listSources } from "../controllers";

export const sourcesRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/sources",
    {
      preValidation: [validateKey],
    },
    listSources as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/sources/:sourceId",
    {
      preValidation: [validateKey],
    },
    getSource as unknown as RouteHandlerMethod
  );
  fastify.delete(
    "/sources/:sourceId",
    {
      preValidation: [validateKey],
    },
    deleteSource as unknown as RouteHandlerMethod
  );
};
