import { Queue, Worker } from "bullmq";
import { connection, concurrency } from "../../core";

// EDITOR
export const EDITOR_QUEUE_NAME = "editorQueue";
export const editorQueue = new Queue(EDITOR_QUEUE_NAME, { connection });

new Worker(
  EDITOR_QUEUE_NAME,
  async (job) => {
    if (job.name === "editor.summary") {
      const { summaries, context, agencyId } = job.data;
    }
  },
  {
    connection,
    concurrency,
  }
);
