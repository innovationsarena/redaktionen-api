"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editor = void 0;
const openai_1 = require("@ai-sdk/openai");
const ai_1 = require("ai");
const zod_1 = __importDefault(require("zod"));
const editor = async () => {
    const prompt = "You are a editor.";
    const { object } = await (0, ai_1.generateObject)({
        model: (0, openai_1.openai)(process.env.EDITOR_DEFAULT_MODEL),
        prompt,
        schema: zod_1.default.object({}),
    });
    return object;
};
exports.editor = editor;
