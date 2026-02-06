import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateAgencyKey } from "../core";
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
      preValidation: [validateAgencyKey],
    },
    listSources as unknown as RouteHandlerMethod
  );
  fastify.post(
    "/sources",
    {
      preValidation: [validateAgencyKey],
    },
    createSource as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/sources/:sourceId",
    {
      preValidation: [validateAgencyKey],
    },
    getSource as unknown as RouteHandlerMethod
  );
  fastify.delete(
    "/sources/:sourceId",
    {
      preValidation: [validateAgencyKey],
    },
    deleteSource as unknown as RouteHandlerMethod
  );
};
