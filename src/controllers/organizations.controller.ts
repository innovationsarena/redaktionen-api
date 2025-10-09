import { FastifyReply, FastifyRequest } from "fastify";
import {
  asyncHandler,
  createPublicKey,
  Organization,
  OrganizationInput,
} from "../core";
import { organizations, summaries } from "../services";

export const createOrganizationController = asyncHandler(
  async (
    request: FastifyRequest<{ Body: OrganizationInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const organization = {
      ...request.body,
    };

    const org = await organizations.write(organization);
    const updatedOrg = await createPublicKey(org);

    return reply.status(200).send({
      id: updatedOrg.id,
      name: updatedOrg.name,
      description: updatedOrg.description,
      apiKey: updatedOrg.public_key,
    });
  }
);

export const getOrganizationController = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { organizationId: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const organization = await organizations.get(request.params.organizationId);

    return reply.status(200).send({
      id: organization.id,
      name: organization.name,
      description: organization.description,
      apiKey: organization.public_key,
    });
  }
);
