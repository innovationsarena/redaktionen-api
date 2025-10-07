import { Queue, Worker } from "bullmq";
import { pestelWorkflow } from "../workflows/pestel.workflow";
import { correspondent } from "../agents";
import { Signal } from "../core";
import { summaries } from "./supabase";

const connection = {
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};
// WORKERS

// TIPSTERS
export const TIPSTER_QUEUE_NAME = "tipsterQueue";
export const tipsterQueue = new Queue(TIPSTER_QUEUE_NAME);

new Worker(
  TIPSTER_QUEUE_NAME,
  async (job) => {
    if (job.name === "tipster.start") {
      await pestelWorkflow(job.data.limit);
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

// TIPSTERS
export const CORRESPONDENT_QUEUE_NAME = "correspondentQueue";
export const correspondentQueue = new Queue(CORRESPONDENT_QUEUE_NAME);

new Worker(
  CORRESPONDENT_QUEUE_NAME,
  async (job) => {
    if (job.name === "correspondent.start") {
      const summary = await correspondent(job.data as Signal);
      if (summary) {
        await summaries.write(summary);
      }
    }
  },
  {
    connection,
    concurrency: 10,
  }
);
