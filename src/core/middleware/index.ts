import { FastifyReply, FastifyRequest } from "fastify";
import { isValid } from "../utils";

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
    return reply.send(400).send("Webhook key not found.");
  }

  const valid = await isValid(key);
  if (valid) {
    return;
  } else {
    return reply.send(401).send("API key not valid.");
  }
};

export const validateApiKey = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!request.headers["authorization"]) {
    return reply.send(400).send("API key not found.");
  }

  const API_KEY = request.headers["authorization"].split(" ")[1];

  const valid = await isValid(API_KEY);

  if (valid) {
    return;
  } else {
    return reply.send(401).send("API key not valid.");
  }
};
