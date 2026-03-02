import { Queue, Worker } from "bullmq";
import { connection, concurrency } from "../../core";
import { correspondent } from "./correspondent.agent";
import { runCorrespondents } from "./correspondent.operations";
import { checkAndTriggerEditor } from "../editor";

// CORRESPONDENT
export const CORRESPONDENT_QUEUE_NAME = "correspondentQueue";
export const correspondentQueue = new Queue(CORRESPONDENT_QUEUE_NAME, {
  connection,
});

new Worker(
  CORRESPONDENT_QUEUE_NAME,
  async (job) => {
    if (job.name === "correspondent.start") {
      const { agency, flowSettings } = job.data;
      await runCorrespondents(agency, flowSettings);
      return;
    }

    if (job.name === "correspondent.summary") {
      const { agency, flowSettings, signal } = job.data;
      await correspondent(agency, flowSettings, signal);
      await checkAndTriggerEditor(agency, flowSettings);
      return;
    }
  },
  {
    connection,
    concurrency,
  }
);
