import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency } from "../../core";
import { runTipsters } from "./tipster.operations";
import { correspondentQueue } from "../correspondent";

// TIPSTER
export const TIPSTER_QUEUE_NAME = "tipsterQueue";
export const tipsterQueue = new Queue(TIPSTER_QUEUE_NAME, { connection });

new Worker(
  TIPSTER_QUEUE_NAME,
  async (job) => {
    if (job.name === "tipster.start") {
      const { agency, flowSettings } = job.data;

      await runTipsters(agency, flowSettings);

      await correspondentQueue.add("correspondent.start", {
        agency,
        flowSettings,
      });
    }
  },
  {
    connection,
    concurrency,
  }
);
