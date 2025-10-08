"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowRouter = void 0;
const core_1 = require("../core");
const controllers_1 = require("../controllers");
const workflowRouter = (fastify) => {
    fastify.post("/workflows", {
        preValidation: [core_1.validateKey],
    }, controllers_1.createWorkflow);
};
exports.workflowRouter = workflowRouter;
