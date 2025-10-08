"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalsRouter = void 0;
const core_1 = require("../core");
const signals_controller_1 = require("../controllers/signals.controller");
const signalsRouter = (fastify) => {
    fastify.get("/signals", {
        preValidation: [core_1.validateKey],
    }, signals_controller_1.listSignals);
};
exports.signalsRouter = signalsRouter;
