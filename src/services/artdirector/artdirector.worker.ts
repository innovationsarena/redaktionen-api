import { Queue, QueueEvents, Worker, Job } from "bullmq";
import { connection, concurrency } from "../../core";

// ART DIRECTOR
export const ARTDIRECTOR_QUEUE_NAME = "artDirectorQueue";
export const artDirectorQueue = new Queue(ARTDIRECTOR_QUEUE_NAME, {
  connection,
});

new Worker(
  ARTDIRECTOR_QUEUE_NAME,
  async (job: Job) => {
    if (job.name === "artdirector.image.summary") {
      const { agencyId, summary, context } = job.data;
    }
    if (job.name === "artdirector.image.report") {
      const { report, agencyId } = job.data;
    }
    if (job.name === "artdirector.image.avatar") {
      const { agencyId, agent } = job.data;
    }
  },
  {
    connection,
    concurrency,
  }
);

// Trigger next based on this queue
const queueEvents = new QueueEvents(ARTDIRECTOR_QUEUE_NAME);

queueEvents.on("completed", async ({ returnvalue: data }) => {
  // react to completion
  console.log(data);
});
