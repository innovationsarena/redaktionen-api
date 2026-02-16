import { FastifyReply, FastifyRequest } from "fastify";
import { isValid, createHash } from "../utils";
import { AgencyContext } from "../types";
import { Agencies } from "../../core";
import { ZodError, ZodSchema } from "zod";
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
  return error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
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
    const message =
      error instanceof Error ? error.message : "Authentication failed";
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
    const message =
      error instanceof Error ? error.message : "Webhook validation failed";
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
      return sendErrorResponse(reply, 401, "Unauthorized", "Invalid API key");
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "API key validation failed";
    return sendErrorResponse(reply, 500, "Internal Server Error", message);
  }
};

/**
 * Validates API key and attaches agency context to request
 * Used for multi-tenant endpoints that need agency information
 *
 * - If master API_KEY is used: request.agency is undefined (admin access to all agencies)
 * - If agency key is used: request.agency contains the AgencyContext
 */
export const validateAgencyKey = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply | void> => {
  // Validate Authorization header exists and has correct format
  const headerValidation = AuthorizationHeaderSchema.safeParse(request.headers);

  if (!headerValidation.success) {
    return reply.code(400).send({
      error: "Bad Request",
      message: formatZodError(headerValidation.error),
      statusCode: 400,
    });
  }

  // Extract Bearer token
  const token = extractBearerToken(request.headers.authorization!);
  if (!token) {
    return reply.code(400).send({
      error: "Bad Request",
      message: "Invalid Authorization header format",
      statusCode: 400,
    });
  }

  // Validate token format
  const tokenValidation = BearerTokenSchema.safeParse(token);
  if (!tokenValidation.success) {
    return reply.code(400).send({
      error: "Bad Request",
      message: formatZodError(tokenValidation.error),
      statusCode: 400,
    });
  }

  // Check if master admin key - grants access to all agencies
  if (token === process.env.API_KEY) {
    // Admin access: request.agency remains undefined
    return;
  }

  // Hash the token and lookup agency
  const hashedKey = await createHash(token);
  const agency = await Agencies.getByApiKey(hashedKey);

  // Reject if error occurred or no agency found
  if (agency === null) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid API key",
      statusCode: 401,
    });
  }

  // Attach agency context to request for downstream use
  const agencyContext: AgencyContext = {
    id: agency.id,
    name: agency.name,
  };

  request.agency = agencyContext;
};

/**
 * Factory that returns a preValidation hook to validate request.body against a Zod schema.
 * On success, replaces request.body with the parsed (and defaulted) data.
 */
export const validateBody = (schema: ZodSchema) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: "Bad Request",
        message: formatZodError(result.error),
        statusCode: 400,
      }) as unknown as void;
    }

    request.body = result.data;
  };
};
