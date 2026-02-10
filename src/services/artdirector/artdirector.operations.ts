import { FastifyRequest } from "fastify";
import { FlowInput, Signals, Summaries } from "../../core";
import { artDirectorQueue } from "./artdirector.worker";
import { editorQueue } from "../editor/editor.worker";

export const checkAndTriggerEditor = async (
  agencyId: string,
  context: FlowInput
) => {
  const signals = await Signals.list({ agencyId });
  const summaries = await Summaries.list({ agencyId });
  const filteredSummaries = summaries.filter((s) => s.posterUrl !== null);

  if (signals.length === filteredSummaries.length) {
    await editorQueue.add("editor.summary", { agencyId, summaries, context });
  }
};
