import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler, AgentInput, Agent, id, AgentType } from "../core";
import { Agents, artDirectorQueue } from "../services";

export const createAgentController = asyncHandler(
  async (
    request: FastifyRequest<{ Body: AgentInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    // Agency key: use authenticated agency's ID
    // Admin key: must provide agencyId in body
    if (!request.agency && !request.body.agencyId) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "agencyId is required when using admin key",
        statusCode: 400,
      });
    }

    const agencyId = request.agency?.id ?? request.body.agencyId;

    const agent: Agent = {
      ...request.body,
      id: request.body.id || id(8),
      agency: agencyId,
      avatarUrl: null,
    };

    await Agents.write(agent);

    await artDirectorQueue.add("artdirector.image.avatar", {
      agent,
    });

    return reply.status(200).send(agent);
  }
);

export const getAgentController = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { agentId: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const agencyId = request.agency?.id;

    const agent = await Agents.get(request.params.agentId, agencyId);

    return reply.status(200).send(agent);
  }
);

export const listAgentsController = asyncHandler(
  async (
    request: FastifyRequest<{ Querystring: { type?: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { type } = request.query;
    const agencyId = request.agency?.id;

    const agents = await Agents.list({
      type: type as AgentType | undefined,
      agencyId,
    });

    return reply.status(200).send(agents);
  }
);

export const updateAgentController = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { agentId: string }; Body: AgentInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const agencyId = request.agency?.id;

    const agent = await Agents.get(request.params.agentId, agencyId);

    // Agency key: preserve original agency (can't change ownership)
    // Admin key: allow changing agency via request body
    const updatedAgent = await Agents.update({
      ...agent,
      ...request.body,
      agency: request.agency ? agent.agency : (request.body.agencyId ?? agent.agency),
    });

    return reply.status(200).send(updatedAgent);
  }
);

export const deleteAgentController = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { agentId: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const agencyId = request.agency?.id;

    const agent = await Agents.delete(request.params.agentId, agencyId);

    return reply.status(200).send(agent);
  }
);
