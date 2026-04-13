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

      await runTipsters(agencyId, job.data.workflow);
      await runCorrespondents(agencyId, job.data.workflow);
    }
  },
  {
    connection,
    concurrency,
  }
);

// Trigger next based on this queue
const queueEvents = new QueueEvents(TIPSTER_QUEUE_NAME);

queueEvents.on("completed", async ({ returnvalue: data }) => {
  // react to completion
  console.log(data);
});
