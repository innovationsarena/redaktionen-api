import { Queue, QueueEvents, Worker, Job } from "bullmq";
import { connection, concurrency } from "../../core";
import { artDirector } from "./artdirector.agent";

// ART DIRECTOR
export const ARTDIRECTOR_QUEUE_NAME = "artDirectorQueue";
export const artDirectorQueue = new Queue(ARTDIRECTOR_QUEUE_NAME, {
  connection,
});

new Worker(
  ARTDIRECTOR_QUEUE_NAME,
  async (job: Job) => {
    if (job.name === "artdirector.image.summary") {
      const { agencyId, summary } = job.data;
      await artDirector(agencyId, summary, "summary");
    }
    if (job.name === "artdirector.image.report") {
      const { agencyId, content } = job.data;
      await artDirector(agencyId, content, "report");
    }
    if (job.name === "artdirector.image.avatar") {
      const { agencyId, agent } = job.data;
      await artDirector(agencyId, agent, "agent");
    }
  },
  {
    connection,
    concurrency,
  }
);
