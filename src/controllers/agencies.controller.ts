import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler, AgencyInput, id, Agency, createHash } from "../core";
import { Agencies } from "../services";

export const createAgencyController = asyncHandler(
  async (
    request: FastifyRequest<{ Body: AgencyInput }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const apiKey = `gr-${id(8)}`;
    const hashedApiKey = await createHash(apiKey);
    const hashedAdminKey = await createHash(process.env.API_KEY as string);

    const agency: Agency = {
      ...request.body,
      id: request.body.id ? request.body.id : id(8),
      private_key: hashedApiKey,
    };

    await Agencies.write(agency);

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
