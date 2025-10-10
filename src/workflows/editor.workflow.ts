import { summaryEditor } from "../agents";
import { Summary, WorkflowInput, Report } from "../core";
import { Reports, Sources } from "../services";

export const editorWorkflow = async (
  summaries: Summary[],
  context: WorkflowInput
): Promise<void> => {
  console.log("Summary editor is generating a summary...");

  const reportContent = await summaryEditor(summaries);
  const s = await Sources.list();

  const report: Report = {
    ...reportContent,
    type: "summary",
    author: "Summary editor",
    sources: s,
    posterUrl: null,
    factors: context.factors,
  };

  await Reports.write(report);
  return;
};
