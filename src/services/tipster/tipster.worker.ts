import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency } from "../../core";

// TIPSTER
export const TIPSTER_QUEUE_NAME = "tipsterQueue";
export const tipsterQueue = new Queue(TIPSTER_QUEUE_NAME, { connection });

new Worker(
  TIPSTER_QUEUE_NAME,
  async (job) => {
    if (job.name === "tipster.start") {
      const { agencyId, workflow } = job.data;
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
