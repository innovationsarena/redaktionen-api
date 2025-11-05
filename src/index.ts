import "dotenv/config";
import fastify from "fastify";
import formbody from "@fastify/formbody";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { readFileSync } from "fs";
import { join } from "path";
import yaml from "yaml";

import { workflowRouter } from "./routes";
import { signalsRouter } from "./routes/signals.route";
import { summariesRouter } from "./routes/summaries.route";
import { agenciesRouter } from "./routes/agencies.route";
import { webhooksRouter } from "./routes/webhooks.route";
import { agentsRouter } from "./routes/agents.route";

const PORT = Number(process.env.PORT) || 3000;

const server = fastify({
  logger: {
    level: "info",
  },
});

server.register(formbody);
server.register(cors);
server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// Load OpenAPI spec from YAML file
const apiSpecPath = join(__dirname, "docs", "apispec.yml");
const apiSpecContent = readFileSync(apiSpecPath, "utf8");
const apiSpec = yaml.parse(apiSpecContent);

// Register Swagger
server.register(swagger, {
  mode: "static",
  specification: {
    document: apiSpec,
  },
});

// Register Swagger UI
server.register(swaggerUi, {
  routePrefix: "/",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
});

server.setErrorHandler((error, _request, reply) => {
  server.log.error(error);
  if (error.message) {
    reply.status(400).send({ error: error.message });
  } else {
    reply.status(500).send({ error: "Oh poo, something went wrong!" });
  }
});

// Routes
server.register(summariesRouter);
server.register(agenciesRouter);
server.register(workflowRouter);
server.register(webhooksRouter);
server.register(signalsRouter);
server.register(agentsRouter);

server.listen({
  port: PORT,
  host: "0.0.0.0",
  listenTextResolver: (address) => {
    return `Redaktionen API server is listening at ${address}`;
  },
});
