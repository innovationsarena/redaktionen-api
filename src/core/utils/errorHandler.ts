import { FastifyReply } from "fastify";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleControllerError = (
  error: unknown,
  reply: FastifyReply
): void => {
  if (error instanceof AppError) {
    reply.log.error(error.message);
    reply.status(error.statusCode).send({ error: error.message });
    return;
  }

  if (error instanceof Error) {
    reply.log.error(error.message);
    reply.status(500).send({ error: error.message });
    return;
  }

  reply.log.error("Unknown error occurred");
  reply.status(500).send({ error: "Internal server error" });
};

export const asyncHandler = (fn: Function) => {
  return async (request: any, reply: FastifyReply) => {
    try {
      return await fn(request, reply);
    } catch (error) {
      handleControllerError(error, reply);
    }
  };
};
