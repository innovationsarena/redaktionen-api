import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey, validateBody, FlowInputSchema } from "../core";
import {
  getAgencyController,
  startAgencyController,
  createAgencyController,
  listAgenciesController,
  updateAgencyController,
  regenerateAgencyKeyController,
  deleteAgencyController,
} from "../controllers";

export const agenciesRouter = (fastify: FastifyInstance) => {
  fastify.post(
    "/agencies",
    {
      preValidation: [validateKey],
    },
    createAgencyController as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/agencies",
    {
      preValidation: [validateKey],
    },
    listAgenciesController as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/agencies/:agencyId",
    {
      preValidation: [validateKey],
    },
    getAgencyController as unknown as RouteHandlerMethod
  );
  fastify.put(
    "/agencies/:agencyId",
    {
      preValidation: [validateKey],
    },
    updateAgencyController as unknown as RouteHandlerMethod
  );
  fastify.delete(
    "/agencies/:agencyId",
    {
      preValidation: [validateKey],
    },
    deleteAgencyController as unknown as RouteHandlerMethod
  );
  fastify.patch(
    "/agencies/:agencyId/key",
    {
      preValidation: [validateKey],
    },
    regenerateAgencyKeyController as unknown as RouteHandlerMethod
  );
  fastify.post(
    "/agencies/:agencyId/start",
    {
      preValidation: [validateKey, validateBody(FlowInputSchema)],
    },
    startAgencyController as unknown as RouteHandlerMethod
  );
};
