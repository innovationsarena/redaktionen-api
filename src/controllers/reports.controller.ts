import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { Reports } from "../services";

export const listReports = asyncHandler(
  async (
    request: FastifyRequest<{ Querystring: { type?: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { type } = request.query;
    const agencyId = request.agency?.id;

    const reports = await Reports.list({ type, agencyId });

    return reply.status(200).send(reports);
  }
);

export const getReport = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { reportId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { reportId } = request.params;
    const agencyId = request.agency?.id;

    const report = await Reports.get(reportId, agencyId);

    return reply.status(200).send(report);
  }
);
