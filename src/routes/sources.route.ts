import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey } from "../core";
import {
  deleteSource,
  getSource,
  listSources,
  createSource,
} from "../controllers";

export const sourcesRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/sources",
    {
      preValidation: [],
    },
    listSources as unknown as RouteHandlerMethod
  );
  fastify.post(
    "/sources",
    {
      preValidation: [validateKey],
    },
    createSource as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/sources/:sourceId",
    {
      preValidation: [],
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
