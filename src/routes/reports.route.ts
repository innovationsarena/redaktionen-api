import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { getReport, listReports } from "../controllers";
import { validateAgencyKey } from "../core";

export const reportsRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/reports",
    {
      preValidation: [validateAgencyKey],
    },
    listReports as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/reports/:reportId",
    {
      preValidation: [validateAgencyKey],
    },
    getReport as unknown as RouteHandlerMethod
  );
};
