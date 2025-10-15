import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { isValid } from "../utils";
import {
  AuthorizationHeaderSchema,
  BearerTokenSchema,
  WebhookQuerySchema,
  ErrorResponse,
} from "./validation.schemas";

/**
 * Formats Zod validation errors into a user-friendly message
 */
function formatZodError(error: ZodError<any>): string {
  return error.issues.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
}

/**
 * Sends a standardized error response
 */
function sendErrorResponse(
  reply: FastifyReply,
  statusCode: number,
  error: string,
  message: string
): FastifyReply {
  const response: ErrorResponse = {
    error,
    message,
    statusCode,
  };
  return reply.status(statusCode).send(response);
}

/**
 * Extracts Bearer token from Authorization header
 */
function extractBearerToken(authHeader: string): string | null {
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  return parts[1];
}

/**
 * Validates master API key from environment variable
 * Used for internal/admin endpoints
 *
 * @throws Error with proper response if validation fails
 */
export const validateKey = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    // Validate Authorization header exists and has correct format
    const headerValidation = AuthorizationHeaderSchema.safeParse(
      request.headers
    );

    if (!headerValidation.success) {
      throw new Error(formatZodError(headerValidation.error));
    }

    // Extract Bearer token
    const token = extractBearerToken(request.headers.authorization!);
    if (!token) {
      throw new Error("Invalid Authorization header format");
    }

    // Validate token format
    const tokenValidation = BearerTokenSchema.safeParse(token);
    if (!tokenValidation.success) {
      throw new Error(formatZodError(tokenValidation.error));
    }

    // Check against master API key
    const valid = process.env.API_KEY === token;

    if (!valid) {
      throw new Error("Invalid API key");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    sendErrorResponse(reply, 401, "Unauthorized", message);
    throw error; // Re-throw to stop request processing
  }
};

/**
 * Validates webhook query parameter key against agency database
 * Used for webhook endpoints that use query-based authentication
 *
 * @returns void on success, sends error response on failure
 */
export const validateWebhook = async (
  request: FastifyRequest<{ Querystring: { key: string } }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    // Validate query parameters with Zod
    const queryValidation = WebhookQuerySchema.safeParse(request.query);

    if (!queryValidation.success) {
      return sendErrorResponse(
        reply,
        400,
        "Bad Request",
        formatZodError(queryValidation.error)
      );
    }

    const { key } = queryValidation.data;

    // Validate key against database
    const valid = await isValid(key, reply);

    if (!valid) {
      return sendErrorResponse(
        reply,
        401,
        "Unauthorized",
        "Invalid webhook key"
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook validation failed";
    return sendErrorResponse(reply, 500, "Internal Server Error", message);
  }
};

/**
 * Validates API key from Authorization header against agency database
 * Used for agency-specific endpoints
 *
 * @returns void on success, sends error response on failure
 */
export const validateApiKey = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    // Validate Authorization header exists and has correct format
    const headerValidation = AuthorizationHeaderSchema.safeParse(
      request.headers
    );

    if (!headerValidation.success) {
      return sendErrorResponse(
        reply,
        400,
        "Bad Request",
        formatZodError(headerValidation.error)
      );
    }

    // Extract Bearer token
    const token = extractBearerToken(request.headers.authorization!);
    if (!token) {
      return sendErrorResponse(
        reply,
        400,
        "Bad Request",
        "Invalid Authorization header format"
      );
    }

    // Validate token format
    const tokenValidation = BearerTokenSchema.safeParse(token);
    if (!tokenValidation.success) {
      return sendErrorResponse(
        reply,
        400,
        "Bad Request",
        formatZodError(tokenValidation.error)
      );
    }

    // Validate key against database
    const valid = await isValid(token, reply);

    if (!valid) {
      return sendErrorResponse(
        reply,
        401,
        "Unauthorized",
        "Invalid API key"
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "API key validation failed";
    return sendErrorResponse(reply, 500, "Internal Server Error", message);
  }
};

// Re-export schemas for use in other parts of the application
export * from "./validation.schemas";
