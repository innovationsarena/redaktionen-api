"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryInputSchema = exports.signalSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signalSchema = zod_1.default.object({
    title: zod_1.default.string(),
    summary: zod_1.default.string(),
    source: zod_1.default.string(),
    sourceUrl: zod_1.default.string().url(),
    date: zod_1.default.string().refine((value) => !isNaN(Date.parse(value)), {
        message: "Invalid date format, must be ISO8601",
    }),
    scope: zod_1.default.enum(["global", "eu", "sweden"]).optional(),
});
exports.summaryInputSchema = zod_1.default.object({
    title: zod_1.default.string(),
    body: zod_1.default.string(),
    scope: zod_1.default.enum(["global", "eu", "sweden"]),
});
