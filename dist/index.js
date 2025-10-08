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
const routes_1 = require("./routes");
const signals_route_1 = require("./routes/signals.route");
const PORT = Number(process.env.PORT) || 3000;
const server = (0, fastify_1.default)({
    logger: {
        level: "info",
    },
});
server.register(formbody_1.default);
server.register(cors_1.default);
server.register(helmet_1.default);
server.setErrorHandler((error, _request, reply) => {
    server.log.error(error);
    if (error.message) {
        reply.status(400).send({ error: error.message });
    }
    else {
        reply.status(500).send({ error: "Oh poo, something went wrong!" });
    }
});
server.get(`/`, (request, reply) => {
    reply.status(200).send({ message: "Hello from Redaktionen API!" });
});
// Routes
server.register(routes_1.workflowRouter);
server.register(signals_route_1.signalsRouter);
server.listen({
    port: PORT,
    host: "0.0.0.0",
    listenTextResolver: (address) => {
        return `Simulator API server is listening at ${address}`;
    },
});
