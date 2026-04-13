import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { getSignal, listSignals } from "../controllers";
import { validateAgencyKey } from "../core";

export const signalsRouter = (fastify: FastifyInstance) => {
  fastify.get(
    "/signals",
    {
      preValidation: [],
    },
    listSignals as unknown as RouteHandlerMethod
  );
  fastify.get(
    "/signals/:signalId",
    {
      preValidation: [],
    },
    getSignal as unknown as RouteHandlerMethod
  );
};
