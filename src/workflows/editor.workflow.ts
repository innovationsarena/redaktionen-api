import { summaryEditor } from "../agents";
import { Summary, WorkflowInput, Report } from "../core";
import { artDirectorQueue, Reports, Signals } from "../services";

export const editorWorkflow = async (
  summaries: Summary[],
  context: WorkflowInput
): Promise<void> => {
  console.log("Summary editor is generating a summary...");

  const { title, lede, body } = await summaryEditor(summaries);
  const s = await Signals.list();

  const report: Report = {
    title,
    lede,
    body,
    type: "summary",
    author: "Summary editor",
    sources: s,
    posterUrl: null,
    factors: context.factors,
  };

  const writtenReport = await Reports.write(report);

  await artDirectorQueue.add("artdirector.image.report", {
    writtenReport,
    context,
  });
  return;
};
