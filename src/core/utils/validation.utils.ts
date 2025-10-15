import { FastifyReply } from "fastify";
import { Agencies } from "../../services";
import { createHash } from "./crypto.utils";

/**
 * Validates an API key against stored agency credentials
 * Hashes the provided key and checks if it matches any agency's private key
 * @param key API key to validate
 * @param reply Fastify reply object for error responses
 * @returns true if valid, false otherwise (sends error response on failure)
 */
export const isValid = async (
  key: string,
  reply: FastifyReply
): Promise<boolean> => {
  const hashedKey = await createHash(key);
  const { data: agency, error } = await Agencies.getByApiKey(hashedKey);
  if (error) return reply.status(400).send(error.message);
  return agency ? true : false;
};
