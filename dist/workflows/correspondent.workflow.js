"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCorrespondentWorkflow = exports.correspondentWorkflow = void 0;
const services_1 = require("../services");
const correspondentWorkflow = async () => {
    const signalsList = await services_1.signals.list();
    console.log(signalsList.length);
    for await (const signal of signalsList) {
        await services_1.correspondentQueue.add("correspondent.start", signal);
    }
};
exports.correspondentWorkflow = correspondentWorkflow;
const runCorrespondentWorkflow = async () => {
    const Signals = await services_1.signals.list();
    for await (const signal of Signals) {
        await services_1.correspondentQueue.add("correspondent.start", signal);
    }
    return;
};
exports.runCorrespondentWorkflow = runCorrespondentWorkflow;
