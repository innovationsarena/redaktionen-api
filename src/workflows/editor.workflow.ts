import { summaryEditor } from "../agents";
import { Summary, WorkflowInput, Report, Agency } from "../core";
import { artDirectorQueue, Reports, Signals } from "../services";

export const editorWorkflow = async (
  agencyId: string,
  summaries: Summary[],
  context: WorkflowInput
): Promise<void> => {
  console.log("Summary editor is generating a summary...");

  const { title, lede, body } = await summaryEditor(summaries);
  const s = await Signals.list();
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
    writtenReport,
    context,
  });
  return;
};
