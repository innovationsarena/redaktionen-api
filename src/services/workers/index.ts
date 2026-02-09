import { editorWorkflow, pestelWorkflow } from "../../workflows";
import { ConnectionOptions, Job, Queue, Worker } from "bullmq";
import { correspondent, artDirector } from "../../agents";
import { Signals, Summaries } from "../supabase";
import { WorkflowInput } from "../../core";
import { createDefaultAgents } from "../../workflows/agent.workflow";

const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

const concurrency = 10;

// MAIN JOB QUEUE
export const JOB_QUEUE_NAME = "jobQueue";
export const jobQueue = new Queue(JOB_QUEUE_NAME, { connection });

new Worker(
  JOB_QUEUE_NAME,
  async (job) => {
    if (job.name === "job.start") {
      const { agencyId, workflow } = job.data;
      await pestelWorkflow(agencyId, workflow);
    }
  },
  {
    connection,
    concurrency,
  }
);

// TIPSTER
export const TIPSTER_QUEUE_NAME = "tipsterQueue";
export const tipsterQueue = new Queue(TIPSTER_QUEUE_NAME, { connection });

new Worker(
  TIPSTER_QUEUE_NAME,
  async (job) => {
    if (job.name === "tipster.start") {
      const { agencyId, workflow } = job.data;
      await pestelWorkflow(agencyId, workflow);
    }
  },
  {
    connection,
    concurrency,
  }
);

// CORRESPONDENT
export const CORRESPONDENT_QUEUE_NAME = "correspondentQueue";
export const correspondentQueue = new Queue(CORRESPONDENT_QUEUE_NAME, {
  connection,
});

new Worker(
  CORRESPONDENT_QUEUE_NAME,
  async (job) => {
    if (job.name === "correspondent.summerize") {
      const { agencyId, signal, context } = job.data;

      const summary = await correspondent(agencyId, signal);

      if (summary) {
        const s = await Summaries.write(summary);
        await artDirectorQueue.add("artdirector.image.summary", {
          agencyId,
          summary: s,
          context,
        });
      }

      if (context.foresight) {
        console.log("Sending to foresight team.");
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
export const artDirectorQueue = new Queue(ARTDIRECTOR_QUEUE_NAME, {
  connection,
});

new Worker(
  ARTDIRECTOR_QUEUE_NAME,
  async (job: Job) => {
    if (job.name === "artdirector.image.summary") {
      const { agencyId, summary, context } = job.data;
      await artDirector(agencyId, summary, "summary");
      await checkAndTriggerEditor(agencyId, context);
    }
    if (job.name === "artdirector.image.report") {
      const { report, agencyId } = job.data;
      await artDirector(agencyId, report, "report");
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

// EDITOR QUEUE
export const EDITOR_QUEUE_NAME = "editorQueue";
export const editorQueue = new Queue(EDITOR_QUEUE_NAME, { connection });

new Worker(
  EDITOR_QUEUE_NAME,
  async (job) => {
    const { summaries, context, agencyId } = job.data;
    if (job.name === "editor.summary") {
      await editorWorkflow(agencyId, summaries, context);
    }
  },
  {
    connection,
    concurrency,
  }
);

// AGENT QUEUE
export const AGENT_QUEUE_NAME = "agentQueue";
export const agentQueue = new Queue(AGENT_QUEUE_NAME, { connection });

new Worker(
  AGENT_QUEUE_NAME,
  async (job) => {
    const { agency } = job.data;
    if (job.name === "agent.createDefault") {
      await createDefaultAgents(agency);
    }
  },
  {
    connection,
    concurrency,
  }
);

// Helper function to check if both queues are empty before calling editor
export async function checkAndTriggerEditor(
  agencyId: string,
  context: WorkflowInput
) {
  const signals = await Signals.list({ agencyId });
  const summaries = await Summaries.list({ agencyId });
  const filteredSummaries = summaries.filter((s) => s.posterUrl !== null);

  if (signals.length === filteredSummaries.length) {
    await editorQueue.add("editor.summary", { agencyId, summaries, context });
  }
}
