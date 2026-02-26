import { runIntegratedEditor, runIsolatedEditor } from "./editor.operations";
import { connection, concurrency } from "../../core";
import { Queue, Worker } from "bullmq";

// EDITOR
export const EDITOR_QUEUE_NAME = "editorQueue";
export const editorQueue = new Queue(EDITOR_QUEUE_NAME, { connection });

new Worker(
  EDITOR_QUEUE_NAME,
  async (job) => {
    if (job.name === "editor.summary.integrated") {
      const { agency, flowSettings } = job.data;
      await runIntegratedEditor(agency, flowSettings);
    }
    if (job.name === "editor.summary.isolated") {
      const { agency, flowSettings } = job.data;
      await runIsolatedEditor(agency, flowSettings);
    }
  },
  {
    connection,
    concurrency,
  }
);
