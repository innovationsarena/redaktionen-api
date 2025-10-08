"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSignals = void 0;
const core_1 = require("../core");
const services_1 = require("../services");
exports.listSignals = (0, core_1.asyncHandler)(async (request, reply) => {
    const { factor } = request.query;
    const f = factor ? factor : undefined;
    const items = await services_1.signals.list(f);
    return reply.status(200).send({
        signals: items,
    });
});
