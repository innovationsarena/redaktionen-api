import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { listSummariesController, getSummaryController } from "../controllers";
import { validateKey } from "../core";

export const summariesRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/summaries",
    {
      preValidation: [],
    },
    listSummariesController as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/summaries/:summary",
    {
      preValidation: [validateKey],
    },
    getSummaryController as unknown as RouteHandlerMethod
  );
};
