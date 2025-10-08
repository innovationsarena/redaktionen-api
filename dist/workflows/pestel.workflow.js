"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pestelWorkflow = void 0;
const agents_1 = require("../agents");
const services_1 = require("../services");
const correspondent_workflow_1 = require("./correspondent.workflow");
const pestelWorkflow = async (limit) => {
    // Run Tipsters
    const LIMIT = limit;
    // Empty tipster jar
    await (0, services_1.emptySignals)();
    const politicalSignals = await (0, agents_1.tipster)("political", LIMIT);
    const economicSignals = await (0, agents_1.tipster)("economic", LIMIT);
    const socialSignals = await (0, agents_1.tipster)("social", LIMIT);
    const technologicalSignals = await (0, agents_1.tipster)("technological", LIMIT);
    const legalSignals = await (0, agents_1.tipster)("legal", LIMIT);
    const environmentalSignals = await (0, agents_1.tipster)("environmental", LIMIT);
    const allSignals = [
        ...politicalSignals,
        ...economicSignals,
        ...socialSignals,
        ...technologicalSignals,
        ...legalSignals,
        ...environmentalSignals,
    ];
    console.log(`---------------------------------------`);
    console.log(`>>> Total ${allSignals.length} signals fetched. <<<`);
    console.log(`---------------------------------------`);
    await (0, services_1.emptySummaries)();
    await (0, correspondent_workflow_1.runCorrespondentWorkflow)();
    return allSignals;
};
exports.pestelWorkflow = pestelWorkflow;
