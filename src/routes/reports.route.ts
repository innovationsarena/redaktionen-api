import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { getReport, listReports } from "../controllers";

export const reportsRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/reports",
    {
      preValidation: [],
    },
    listReports as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/reports/:reportId",
    {
      preValidation: [],
    },
    getReport as unknown as RouteHandlerMethod
  );
};
