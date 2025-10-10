import { Queue, Worker } from "bullmq";
import { pestelWorkflow } from "../../workflows/pestel.workflow";
import { correspondent, artDirector } from "../../agents";
import { Signal, Summary } from "../../core";
import { summaries } from "../supabase";

const connection = {
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};
// WORKERS

// TIPSTER
export const TIPSTER_QUEUE_NAME = "tipsterQueue";
export const tipsterQueue = new Queue(TIPSTER_QUEUE_NAME);

new Worker(
  TIPSTER_QUEUE_NAME,
  async (job) => {
    if (job.name === "tipster.start") {
      await pestelWorkflow(job.data);
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

// CORRESPONDENT
export const CORRESPONDENT_QUEUE_NAME = "correspondentQueue";
export const correspondentQueue = new Queue(CORRESPONDENT_QUEUE_NAME);

new Worker(
  CORRESPONDENT_QUEUE_NAME,
  async (job) => {
    if (job.name === "correspondent.summerize") {
      const { signal, context } = job.data;

      const summary = await correspondent(signal);

      if (summary) {
        const s = await summaries.write(summary);
        await artDirectorQueue.add("artdirector.image", s);
      }

      if (context.forsight) {
        console.log("Sending to forsight team.");
      }
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

// ART DIRECTOR
export const ARTDIRECTOR_QUEUE_NAME = "artDirectorQueue";
export const artDirectorQueue = new Queue(ARTDIRECTOR_QUEUE_NAME);

new Worker(
  ARTDIRECTOR_QUEUE_NAME,
  async (job) => {
    if (job.name === "artdirector.image") {
      await artDirector(job.data as Summary);
    }
  },
  {
    connection,
    concurrency: 10,
  }
);
