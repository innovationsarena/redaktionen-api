import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency } from "../../core";

// CORRESPONDENT
export const CORRESPONDENT_QUEUE_NAME = "correspondentQueue";
export const correspondentQueue = new Queue(CORRESPONDENT_QUEUE_NAME, {
  connection,
});

new Worker(
  CORRESPONDENT_QUEUE_NAME,
  async (job) => {
    if (job.name === "correspondent.summary") {
      const { agencyId, signal, context } = job.data;
    }
  },
  {
    connection,
    concurrency,
  }
);

// Trigger next based on this queue
const queueEvents = new QueueEvents(CORRESPONDENT_QUEUE_NAME);

queueEvents.on("completed", async ({ returnvalue: data }) => {
  // react to completion
  console.log(data);
});
