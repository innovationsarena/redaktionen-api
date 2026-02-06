import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler, AgentInput, Agent, id, AgentType } from "../core";
import { Agents, artDirectorQueue } from "../services";

export const createAgentController = asyncHandler(
  async (
    request: FastifyRequest<{ Body: AgentInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const agencyId = request.agency?.id;

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
    const updatedAgent = await Agents.update({ ...agent, ...request.body });

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
