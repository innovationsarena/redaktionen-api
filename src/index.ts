import "dotenv/config";
import fastify from "fastify";
import formbody from "@fastify/formbody";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

import { workflowRouter } from "./routes";
import { signalsRouter } from "./routes/signals.route";

const PORT = Number(process.env.PORT) || 3000;

const server = fastify({
  logger: {
    level: "info",
  },
});

server.register(formbody);
server.register(cors);
server.register(helmet);

server.setErrorHandler((error, _request, reply) => {
  server.log.error(error);
  if (error.message) {
    reply.status(400).send({ error: error.message });
  } else {
    reply.status(500).send({ error: "Oh poo, something went wrong!" });
  }
});

server.get(`/`, (request, reply) => {
  reply.status(200).send({ message: "Hello from Redaktionen API!" });
});

// Routes
server.register(workflowRouter);
server.register(signalsRouter);

server.listen({
  port: PORT,
  host: "0.0.0.0",
  listenTextResolver: (address) => {
    return `Simulator API server is listening at ${address}`;
  },
});
