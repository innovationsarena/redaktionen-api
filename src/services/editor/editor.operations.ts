import { summaryEditor } from "./editor.agent";
import { Summary, FlowInput, Report, Signals, Reports } from "../../core";
import { artDirectorQueue } from "../artdirector/artdirector.worker";

export const runEditor = async (
  agencyId: string,
  summaries: Summary[],
  context: FlowInput
): Promise<void> => {
  console.log("Summary editor is generating a summary...");

  const { title, lede, body } = await summaryEditor(summaries);
  const s = await Signals.list({ agencyId });
  const type = "summary";

  const report: Report = {
    id: `${agencyId}-${type}-${Date.now()}`,
    title,
    lede,
    body,
    type,
    author: "Summary editor",
    sources: s,
    posterUrl: null,
    factors: context.factors,
    agency: agencyId,
  };

  const writtenReport = await Reports.write(report);

  await artDirectorQueue.add("artdirector.image.report", {
    agencyId,
    report: writtenReport,
    context,
  });
};
