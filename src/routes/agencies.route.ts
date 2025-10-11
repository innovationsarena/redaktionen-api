import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey } from "../core";
import {
  getAgencyController,
  createAgencyController,
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
    "/agencies/:agencyId",
    {
      preValidation: [validateKey],
    },
    getAgencyController as unknown as RouteHandlerMethod
  );
};
