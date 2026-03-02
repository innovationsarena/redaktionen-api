import { Queue, Worker } from "bullmq";
import { connection, concurrency } from "../../core";
import { createDefaultAgents } from "./agent.agent";

// AGENT
export const AGENT_QUEUE_NAME = "agentQueue";
export const agentQueue = new Queue(AGENT_QUEUE_NAME, { connection });

new Worker(
  AGENT_QUEUE_NAME,
  async (job) => {
    if (job.name === "agent.createDefault") {
      const { agency } = job.data;
      await createDefaultAgents(agency);
      return;
    }
  },
  {
    connection,
    concurrency,
  }
);
