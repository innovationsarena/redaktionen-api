import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateAgencyKey } from "../core";
import {
  getAgentController,
  createAgentController,
  updateAgentController,
  deleteAgentController,
  listAgentsController,
} from "../controllers";

export const agentsRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/agents",
    {
      preValidation: [validateAgencyKey],
    },
    listAgentsController as unknown as RouteHandlerMethod
  );
  fastify.post(
    "/agents",
    {
      preValidation: [validateAgencyKey],
    },
    createAgentController as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/agents/:agentId",
    {
      preValidation: [validateAgencyKey],
    },
    getAgentController as unknown as RouteHandlerMethod
  );
  fastify.patch(
    "/agents/:agentId",
    {
      preValidation: [validateAgencyKey],
    },
    updateAgentController as unknown as RouteHandlerMethod
  );
  fastify.delete(
    "/agents/:agentId",
    {
      preValidation: [validateAgencyKey],
    },
    deleteAgentController as unknown as RouteHandlerMethod
  );
};
