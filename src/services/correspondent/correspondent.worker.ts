import { Queue, QueueEvents, Worker } from "bullmq";
import { connection, concurrency, Summaries, Summary } from "../../core";
import { correspondent } from "./correspondent.agent";
import { artDirectorQueue } from "../artdirector";
import { checkAndTriggerEditor } from "../editor";

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

      const summary = await correspondent(agencyId, signal);
      const sum = await Summaries.write(summary as Summary);
      await artDirectorQueue.add("artdirector.image.summary", {
        agencyId,
        summary: sum,
        context,
      });

      await checkAndTriggerEditor(agencyId, context);
    }
  },
  {
    connection,
    concurrency,
  }
);
