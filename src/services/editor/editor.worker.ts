import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency } from "../../core";
import { runEditor } from "./editor.operations";

// EDITOR
export const EDITOR_QUEUE_NAME = "editorQueue";
export const editorQueue = new Queue(EDITOR_QUEUE_NAME, { connection });

new Worker(
  EDITOR_QUEUE_NAME,
  async (job) => {
    if (job.name === "editor.summary") {
      const { summaries, context, agencyId } = job.data;
      await runEditor(agencyId, summaries, context);
    }
  },
  {
    connection,
    concurrency,
  }
);
