import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency, Summaries } from "../../core";
import { correspondent } from "./correspondent.agent";
import { runCorrespondents } from "./correspondent.operations";

// CORRESPONDENT
export const CORRESPONDENT_QUEUE_NAME = "correspondentQueue";
export const correspondentQueue = new Queue(CORRESPONDENT_QUEUE_NAME, {
  connection,
});

new Worker(
  CORRESPONDENT_QUEUE_NAME,
  async (job) => {
    if (job.name === "correspondent.start") {
      const { agency, flowSettings } = job.data;
      await runCorrespondents(agency, flowSettings);
    }

    if (job.name === "correspondent.summary") {
      const { agency, flowSettings, signal } = job.data;
      await correspondent(agency, flowSettings, signal);
    }
  },
  {
    connection,
    concurrency,
  }
);
