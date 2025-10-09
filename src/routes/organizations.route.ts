import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey } from "../core";
import {
  getOrganizationController,
  createOrganizationController,
} from "../controllers";

export const organizationsRouter = (fastify: FastifyInstance) => {
  fastify.post(
    "/organizations",
    {
      preValidation: [validateKey],
    },
    createOrganizationController as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/organizations/:organizationId",
    {
      preValidation: [validateKey],
    },
    getOrganizationController as unknown as RouteHandlerMethod
  );
};
