import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency } from "../../core";
import { tipster } from "./tipster.agent";
import { runTipsters } from "./tipster.operations";
import { runCorrespondents } from "../correspondent";

// TIPSTER
export const TIPSTER_QUEUE_NAME = "tipsterQueue";
export const tipsterQueue = new Queue(TIPSTER_QUEUE_NAME, { connection });

new Worker(
  TIPSTER_QUEUE_NAME,
  async (job) => {
    if (job.name === "tipster.start") {
      const { agencyId } = job.data;

      await runTipsters(agencyId, job.data.context);
      await runCorrespondents(agencyId, job.data.context);
    }
  },
  {
    connection,
    concurrency,
  }
);
