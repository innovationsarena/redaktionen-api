"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = __importDefault(require("yaml"));
const routes_1 = require("./routes");
const signals_route_1 = require("./routes/signals.route");
const summaries_route_1 = require("./routes/summaries.route");
const PORT = Number(process.env.PORT) || 3000;
const server = (0, fastify_1.default)({
    logger: {
        level: "info",
    },
});
server.register(formbody_1.default);
server.register(cors_1.default);
server.register(helmet_1.default, {
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
const apiSpecPath = (0, path_1.join)(__dirname, "docs", "apispec.yml");
const apiSpecContent = (0, fs_1.readFileSync)(apiSpecPath, "utf8");
const apiSpec = yaml_1.default.parse(apiSpecContent);
// Register Swagger
server.register(swagger_1.default, {
    mode: "static",
    specification: {
        document: apiSpec,
    },
});
// Register Swagger UI
server.register(swagger_ui_1.default, {
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
    }
    else {
        reply.status(500).send({ error: "Oh poo, something went wrong!" });
    }
});
// Routes
server.register(routes_1.workflowRouter);
server.register(signals_route_1.signalsRouter);
server.register(summaries_route_1.summariesRouter);
server.listen({
    port: PORT,
    host: "0.0.0.0",
    listenTextResolver: (address) => {
        return `Redaktionen API server is listening at ${address}`;
    },
});
