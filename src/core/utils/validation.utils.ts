import { FastifyReply } from "fastify";
import { Agencies } from "../../core";
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
  const data = await Agencies.getByApiKey(hashedKey);
  if (!data) return reply.status(400).send("not valid Agency");
  return data ? true : false;
};
