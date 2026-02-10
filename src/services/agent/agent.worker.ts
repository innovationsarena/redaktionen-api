import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency } from "../../core";

// AGENT
export const AGENT_QUEUE_NAME = "agentQueue";
export const agentQueue = new Queue(AGENT_QUEUE_NAME, { connection });

new Worker(
  AGENT_QUEUE_NAME,
  async (job) => {
    if (job.name === "agent.createDefault") {
      const { agency } = job.data;
    }
  },
  {
    connection,
    concurrency,
  }
);

// Trigger next based on this queue
const queueEvents = new QueueEvents(AGENT_QUEUE_NAME);

queueEvents.on("completed", async ({ returnvalue: data }) => {
  // react to completion
  console.log(data);
});
