import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../core";
import { Reports } from "../services";

export const listReports = asyncHandler(
  async (
    request: FastifyRequest<{ Querystring: { type?: string } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { type } = request.query;

    const reports = await Reports.list(type);

    return reply.status(200).send(reports);
  }
);

export const getReport = asyncHandler(
  async (
    request: FastifyRequest<{ Params: { reportId: number } }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const { reportId } = request.params;

    const report = await Reports.get(reportId);

    return reply.status(200).send(report);
  }
);
