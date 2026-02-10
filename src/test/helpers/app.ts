import fastify, { FastifyInstance } from "fastify";
import formbody from "@fastify/formbody";
import cors from "@fastify/cors";

import {
  agenciesRouter,
  agentsRouter,
  signalsRouter,
  sourcesRouter,
  summariesRouter,
  webhooksRouter,
  reportsRouter,
} from "../../routes";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({ logger: false });

  await app.register(formbody);
  await app.register(cors);

  app.setErrorHandler((error, _request, reply) => {
    if (error.message) {
      reply.status(400).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Oh poo, something went wrong!" });
    }
  });

  app.register(agenciesRouter);
  app.register(agentsRouter);
  app.register(signalsRouter);
  app.register(sourcesRouter);
  app.register(summariesRouter);
  app.register(webhooksRouter);
  app.register(reportsRouter);

  await app.ready();
  return app;
}
