import { z } from "zod";

/**
 * Schema for Authorization header validation
 */
export const AuthorizationHeaderSchema = z.object({
  authorization: z
    .string()
    .min(1, "Authorization header is required")
    .refine(
      (value) => value.startsWith("Bearer "),
      "Authorization header must use Bearer token format"
    ),
});

/**
 * Schema for Bearer token extraction
 */
export const BearerTokenSchema = z
  .string()
  .min(1, "Bearer token is required")
  .refine(
    (value) => value.length > 0,
    "Bearer token cannot be empty"
  );

/**
 * Schema for webhook query parameters
 */
export const WebhookQuerySchema = z.object({
  key: z
    .string()
    .min(1, "Webhook key is required")
    .describe("API key for webhook authentication"),
});

/**
 * Error response schema for consistent error formatting
 */
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
