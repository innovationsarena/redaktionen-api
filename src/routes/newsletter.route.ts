import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { handleControllerError, validateKey } from "../core";

export const newsletterRouter = (fastify: FastifyInstance) => {
  fastify.post(
    "/newsletter",
    {
      preValidation: [],
    },
    handleControllerError as unknown as RouteHandlerMethod
  );
};
