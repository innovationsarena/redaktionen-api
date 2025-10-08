"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowRouter = void 0;
const controllers_1 = require("../controllers");
const workflowRouter = (fastify) => {
    fastify.get("/workflows", {
        config: {
            description: "Creates a new workflow.",
        },
        preValidation: [],
        preHandler: [],
    }, controllers_1.createWorkflow);
};
exports.workflowRouter = workflowRouter;
