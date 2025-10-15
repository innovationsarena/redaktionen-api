import { ConnectionOptions, Job, Queue, Worker } from "bullmq";
import { correspondent, artDirector, summaryEditor } from "../../agents";
import { editorWorkflow, pestelWorkflow } from "../../workflows";
import { Signals, Summaries } from "../supabase";
import { WorkflowInput } from "../../core";

const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

const concurrency = 10;

// WORKERS

// TIPSTER
export const TIPSTER_QUEUE_NAME = "tipsterQueue";
export const tipsterQueue = new Queue(TIPSTER_QUEUE_NAME);

new Worker(
  TIPSTER_QUEUE_NAME,
  async (job) => {
    if (job.name === "tipster.start") {
      await pestelWorkflow(job.data);
    }
  },
  {
    connection,
    concurrency,
  }
);

// CORRESPONDENT
export const CORRESPONDENT_QUEUE_NAME = "correspondentQueue";
export const correspondentQueue = new Queue(CORRESPONDENT_QUEUE_NAME);

new Worker(
  CORRESPONDENT_QUEUE_NAME,
  async (job) => {
    if (job.name === "correspondent.summerize") {
      const { signal, context } = job.data;

      const summary = await correspondent(signal);

      if (summary) {
        const s = await Summaries.write(summary);
        await artDirectorQueue.add("artdirector.image.summary", {
          summary: s,
          context,
        });
      }

      if (context.forsight) {
        console.log("Sending to forsight team.");
      }
    }
  },
  {
    connection,
    concurrency,
  }
);

// ART DIRECTOR
export const ARTDIRECTOR_QUEUE_NAME = "artDirectorQueue";
export const artDirectorQueue = new Queue(ARTDIRECTOR_QUEUE_NAME);

new Worker(
  ARTDIRECTOR_QUEUE_NAME,
  async (job: Job) => {
    if (job.name === "artdirector.image.summary") {
      const { summary, context } = job.data;
      await artDirector(summary, "summary");
      await checkAndTriggerEditor(context);
    }
    if (job.name === "artdirector.image.report") {
      const { report } = job.data;
      await artDirector(report, "report");
    }
  },
  {
    connection,
    concurrency,
  }
);

// EDITOR QUEUE
export const EDITOR_QUEUE_NAME = "editorQueue";
export const editorQueue = new Queue(EDITOR_QUEUE_NAME);

new Worker(
  EDITOR_QUEUE_NAME,
  async (job) => {
    const { summaries, context } = job.data;
    if (job.name === "editor.summary") {
      await editorWorkflow(summaries, context);
    }
  },
  {
    connection,
    concurrency,
  }
);

// Helper function to check if both queues are empty before calling editor
export async function checkAndTriggerEditor(context: WorkflowInput) {
  const signals = await Signals.list();
  const summaries = await Summaries.list();
  const filteredSummaries = summaries.filter((s) => s.posterUrl !== null);

  if (signals.length === filteredSummaries.length) {
    await editorQueue.add("editor.summary", { summaries, context });
  }
}
