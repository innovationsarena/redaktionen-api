import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency } from "../../core";
import { runTipsters } from "./tipster.operations";

// TIPSTER
export const TIPSTER_QUEUE_NAME = "tipsterQueue";
export const tipsterQueue = new Queue(TIPSTER_QUEUE_NAME, { connection });

new Worker(
  TIPSTER_QUEUE_NAME,
  async (job) => {
    if (job.name === "tipster.start") {
      const { agency, context } = job.data;

      await runTipsters(agency, context);
      await job.isCompleted();
    }
  },
  {
    connection,
    concurrency,
  }
);
