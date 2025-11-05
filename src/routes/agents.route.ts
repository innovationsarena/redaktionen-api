import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { validateKey } from "../core";
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
      preValidation: [],
    },
    listAgentsController as unknown as RouteHandlerMethod
  );
  fastify.post(
    "/agents",
    {
      preValidation: [validateKey],
    },
    createAgentController as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/agents/:agentId",
    {
      preValidation: [],
    },
    getAgentController as unknown as RouteHandlerMethod
  );
  fastify.patch(
    "/agents/:agentId",
    {
      preValidation: [validateKey],
    },
    updateAgentController as unknown as RouteHandlerMethod
  );
  fastify.delete(
    "/agents/:agentId",
    {
      preValidation: [validateKey],
    },
    deleteAgentController as unknown as RouteHandlerMethod
  );
};
