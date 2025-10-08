"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkflow = void 0;
const core_1 = require("../core");
const services_1 = require("../services");
exports.createWorkflow = (0, core_1.asyncHandler)(async (request, reply) => {
    const { limit } = request.query;
    services_1.tipsterQueue.add("tipster.start", { limit: 1 });
    return reply.status(200).send({
        message: "Workflow started.",
    });
});
