import { FastifyReply, FastifyRequest } from "fastify";
import {
  asyncHandler,
  AgencyInput,
  id,
  Agency,
  createHash,
  WorkflowInput,
} from "../core";
import { Agencies, agentQueue, tipsterQueue } from "../services";

export const createAgencyController = asyncHandler(
  async (
    request: FastifyRequest<{ Body: AgencyInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const apiKey = `gr-${id(8)}`;
    const hashedApiKey = await createHash(apiKey);
    const { name, owner, description, defaultAgents } = request.body;

    const agency: Agency = {
      id: request.body.id ? request.body.id : id(8),
      name,
      owner,
      description: description ? description : "Awesome Agency",
      private_key: hashedApiKey,
    };

    await Agencies.write(agency);

    if (defaultAgents) {
      await agentQueue.add("agent.createDefault", agency);
    }

    return reply.status(200).send({
      apiKey,
    });
  }
);

export const getAgencyController = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { agencyId: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const agency = await Agencies.get(request.params.agencyId);

    return reply.status(200).send({
      id: agency.id,
      name: agency.name,
      description: agency.description,
    });
  }
);

export const listAgenciesController = asyncHandler(
  async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const agencies = await Agencies.list();

    return reply.status(200).send(
      agencies.map((agency) => ({
        id: agency.id,
        name: agency.name,
        description: agency.description,
      }))
    );
  }
);

export const updateAgencyController = asyncHandler(
  async (
    request: FastifyRequest<{
      Params: { agencyId: string };
      Body: AgencyInput;
    }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const agency = await Agencies.get(request.params.agencyId);

    const updatedAgency = await Agencies.update({
      ...agency,
      ...request.body,
      id: agency.id,
      private_key: agency.private_key,
    });

    return reply.status(200).send({
      id: updatedAgency.id,
      name: updatedAgency.name,
      description: updatedAgency.description,
    });
  }
);

export const regenerateAgencyKeyController = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { agencyId: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const agency = await Agencies.get(request.params.agencyId);

    const apiKey = `gr-${id(8)}`;
    const hashedApiKey = await createHash(apiKey);

    await Agencies.update({
      ...agency,
      private_key: hashedApiKey,
    });

    return reply.status(200).send({ apiKey });
  }
);

export const startAgencyController = asyncHandler(
  async (
    request: FastifyRequest<{
      Params: { agencyId: string };
      Body: WorkflowInput;
    }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    tipsterQueue.add("tipster.start", {
      agencyId: request.agency?.id,
      workflow: request.body,
    });

    return reply.status(200).send({
      message: `Agency ${request.agency?.name} started working with interval ${request.body.interval}h.`,
    });
  }
);
