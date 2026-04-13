import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency } from "../../core";
import { runIntegratedEditor, runIsolatedEditor } from "./editor.operations";

// EDITOR
export const EDITOR_QUEUE_NAME = "editorQueue";
export const editorQueue = new Queue(EDITOR_QUEUE_NAME, { connection });

new Worker(
  EDITOR_QUEUE_NAME,
  async (job) => {
    if (job.name === "editor.report.integrated") {
      const { agency, context } = job.data;
      await runIntegratedEditor(agency, context);
    }
    if (job.name === "editor.report.isolated") {
      const { agency, context } = job.data;
      await runIsolatedEditor(agency, context);
    }
  },
  {
    connection,
    concurrency,
  }
);
