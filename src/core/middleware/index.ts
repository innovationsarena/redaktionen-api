import { FastifyReply, FastifyRequest } from "fastify";
import { Agencies } from "../../services";

export const validateKey = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!request.headers["authorization"]) {
    throw new Error("API key not found.");
  }

  const API_KEY = request.headers["authorization"].split(" ")[1];

  if (!API_KEY) {
    throw new Error("API key not found.");
  }

  const valid = process.env.API_KEY === API_KEY;

  if (valid) {
    return;
  } else throw new Error("API key not valid.");
};

export const validateWebhook = async (
  request: FastifyRequest<{ Querystring: { key: string } }>,
  reply: FastifyReply
) => {
  const { key } = request.query;

  if (!key) {
    throw new Error("Webhook key not found.");
  }

  const agency = await Agencies.getByApiKey(key);
  if (!agency) return reply.status(400).send("no no no");
  const valid = agency ? true : false;
  // Lookup key

  if (valid) {
    return;
  } else throw new Error("API key not valid.");
};

export const validateApiKey = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!request.headers["authorization"]) {
    throw new Error("API key not found.");
  }

  const API_KEY = request.headers["authorization"].split(" ")[1];

  if (!API_KEY) {
    throw new Error("API key not found.");
  }

  const agency = await Agencies.getByApiKey(API_KEY);

  const valid = process.env.API_KEY === API_KEY;

  if (valid) {
    return;
  } else throw new Error("API key not valid.");
};
