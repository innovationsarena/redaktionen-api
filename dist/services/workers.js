"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artDirectorQueue = exports.ARTDIRECTOR_QUEUE_NAME = exports.correspondentQueue = exports.CORRESPONDENT_QUEUE_NAME = exports.tipsterQueue = exports.TIPSTER_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const pestel_workflow_1 = require("../workflows/pestel.workflow");
const agents_1 = require("../agents");
const supabase_1 = require("./supabase");
const connection = {
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
};
// WORKERS
// TIPSTER
exports.TIPSTER_QUEUE_NAME = "tipsterQueue";
exports.tipsterQueue = new bullmq_1.Queue(exports.TIPSTER_QUEUE_NAME);
new bullmq_1.Worker(exports.TIPSTER_QUEUE_NAME, async (job) => {
    if (job.name === "tipster.start") {
        await (0, pestel_workflow_1.pestelWorkflow)(job.data.limit);
    }
}, {
    connection,
    concurrency: 10,
});
// CORRESPONDENT
exports.CORRESPONDENT_QUEUE_NAME = "correspondentQueue";
exports.correspondentQueue = new bullmq_1.Queue(exports.CORRESPONDENT_QUEUE_NAME);
new bullmq_1.Worker(exports.CORRESPONDENT_QUEUE_NAME, async (job) => {
    if (job.name === "correspondent.start") {
        const summary = await (0, agents_1.correspondent)(job.data);
        if (summary) {
            const s = await supabase_1.summaries.write(summary);
            await exports.artDirectorQueue.add("artdirector.image", s);
        }
    }
}, {
    connection,
    concurrency: 10,
});
// ART DIRECTOR
exports.ARTDIRECTOR_QUEUE_NAME = "artDirectorQueue";
exports.artDirectorQueue = new bullmq_1.Queue(exports.ARTDIRECTOR_QUEUE_NAME);
new bullmq_1.Worker(exports.ARTDIRECTOR_QUEUE_NAME, async (job) => {
    if (job.name === "artdirector.image") {
        console.log("AD job recieved.");
        await (0, agents_1.artDirector)(job.data);
    }
}, {
    connection,
    concurrency: 10,
});
