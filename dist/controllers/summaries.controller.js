"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryController = exports.listSummariesController = void 0;
const core_1 = require("../core");
const services_1 = require("../services");
exports.listSummariesController = (0, core_1.asyncHandler)(async (request, reply) => {
    const Summaries = await services_1.summaries.list();
    return reply.status(200).send(Summaries);
});
exports.getSummaryController = (0, core_1.asyncHandler)(async (request, reply) => {
    const summary = await services_1.summaries.get(request.params.summary);
    return reply.status(200).send(summary);
});
