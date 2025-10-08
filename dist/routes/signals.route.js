"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalsRouter = void 0;
const signals_controller_1 = require("../controllers/signals.controller");
const signalsRouter = (fastify) => {
    fastify.get("/signals", {
        config: {
            description: "List signals.",
        },
        preValidation: [],
        preHandler: [],
    }, signals_controller_1.listSignals);
};
exports.signalsRouter = signalsRouter;
