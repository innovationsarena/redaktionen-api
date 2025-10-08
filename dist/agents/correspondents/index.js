"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correspondent = void 0;
const ai_1 = require("ai");
const core_1 = require("../../core");
const openai_1 = require("@ai-sdk/openai");
const correspondent = async (signal, filter) => {
    console.log(`${signal.factor} correspondent on the case summarizing >>> ${signal.sourceUrl} <<<.`);
    const resp = await fetch(signal.sourceUrl);
    const rawHTML = await resp.text();
    const system = `
  You are given a HTML code. I want to you collect the information on it and write a summaried article with title and body text in swedish. The summary should be short and clear without loosing any vital information. ${filter ? filter : ""}`;
    try {
        const { object } = await (0, ai_1.generateObject)({
            model: (0, openai_1.openai)(process.env.CORRESPONDENT_DEFAULT_MODEL),
            system,
            prompt: rawHTML.substring(0, 300000),
            schema: core_1.summaryInputSchema,
        });
        const summary = {
            ...object,
            signalId: signal?.id,
            posterUrl: null,
            date: signal.date,
            factor: signal.factor,
            sourceUrl: signal.sourceUrl,
        };
        return summary;
    }
    catch (error) {
        console.log(error);
    }
};
exports.correspondent = correspondent;
