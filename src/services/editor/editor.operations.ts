import { summaryEditor } from "./editor.agent";
import { artDirectorQueue } from "../artdirector/artdirector.worker";
import {
  FlowInput,
  Report,
  Signals,
  Reports,
  Summaries,
  AgencyContext,
} from "../../core";

export const checkAndTriggerEditor = async (
  agency: AgencyContext,
  flowSettings: FlowInput
) => {
  const { id: agencyId } = agency;

  const signals = await Signals.list({ agencyId });
  const summaries = await Summaries.list({ agencyId });
  const filteredSummaries = summaries.filter((s) => s.posterUrl !== null);

  // Check if all summaries are done
  if (signals.length === filteredSummaries.length) {
    if (flowSettings.products.report == "integrated") {
      // editor.integrated.summary
    }

    if (flowSettings.products.report == "isolated") {
      // editor.isolated.summary
    }

    if (flowSettings.products.analytics) {
      // analytics.create
    }

    if (flowSettings.products.foresight) {
      // foresight.create
    }
  }
};

export const runEditor = async (
  agency: AgencyContext,
  flowSettings: FlowInput
): Promise<void> => {
  console.log(
    `Summary editor is generating a summary report of type '${flowSettings.products.report}'...`
  );

  const { id: agencyId } = agency;

  const summaries = await Summaries.list({ agencyId });

  const { title, lede, body } = await summaryEditor(summaries);
  const signals = await Signals.list({ agencyId });
  const type = "summary";

  const report: Report = {
    id: `${agencyId}-${type}-${Date.now()}`,
    title,
    lede,
    body,
    type,
    author: "Summary editor",
    sources: signals,
    posterUrl: null,
    factors: flowSettings.factors,
    agency: agencyId,
  };

  const writtenReport = await Reports.write(report);

  await artDirectorQueue.add("artdirector.image.report", {
    agencyId,
    report: writtenReport,
    flowSettings,
  });
};
