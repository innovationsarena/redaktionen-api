import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler, createPublicKey, AgencyInput, id } from "../core";
import { Agencies } from "../services";

export const createAgencyController = asyncHandler(
  async (
    request: FastifyRequest<{ Body: AgencyInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const agency = {
      ...request.body,
    };

    const org = await Agencies.write(agency);
    const updatedOrg = await createPublicKey(org);

    return reply.status(200).send({
      id: agency.id ? agency.id : id(4),
      name: updatedOrg.name,
      description: updatedOrg.description,
      apiKey: updatedOrg.public_key,
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
      apiKey: agency.public_key,
    });
  }
);
