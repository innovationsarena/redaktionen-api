"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summariesRouter = void 0;
const controllers_1 = require("../controllers");
const core_1 = require("../core");
const summariesRouter = (fastify) => {
    fastify.get("/summaries", {
        preValidation: [core_1.validateKey],
    }, controllers_1.listSummariesController);
    fastify.get("/summaries/:summary", {
        preValidation: [core_1.validateKey],
    }, controllers_1.getSummaryController);
};
exports.summariesRouter = summariesRouter;
