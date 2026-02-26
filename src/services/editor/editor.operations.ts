import { artDirectorQueue } from "../artdirector/artdirector.worker";
import { integratedEditor, isolatedEditor } from "./editor.agent";
import {
  FlowInput,
  Report,
  Signals,
  Reports,
  Summaries,
  AgencyContext,
} from "../../core";
import { editorQueue } from "./editor.worker";

export const checkAndTriggerEditor = async (
  agency: AgencyContext,
  flowSettings: FlowInput
) => {
  const { id: agencyId } = agency;

  const signals = await Signals.list({ agencyId });
  const summaries = await Summaries.list({ agencyId });

  console.log(summaries.length + " / " + signals.length + " summaries done");

  if (signals.length === summaries.length) {
    // When all summaries are done
    console.log("ALL DONE");
    await productSwitch(agency, flowSettings);
  }
};

async function productSwitch(agency: AgencyContext, flowSettings: FlowInput) {
  const { products } = flowSettings;
  console.log(products.report);
  // Report
  switch (products.report) {
    case "integrated":
      await editorQueue.add("editor.summary.integrated", {
        agency,
        flowSettings,
      });

    case "isolated":
      await editorQueue.add("editor.summary.isolated", {
        agency,
        flowSettings,
      });
  }
  // Foresight
  switch (products.foresight) {
    case "integrated":
      console.log("foresight.integrated");
    case "isolated":
      console.log("foresight.isolated");
    case "disabled":
      console.log("foresight.disabled");
  }
  // Analysis
  switch (products.analysis) {
    case "integrated":
      console.log("analysis.integrated");
    case "isolated":
      console.log("analysis.isolated");
    case "disabled":
      console.log("analysis.disabled");
  }
}

export const runIntegratedEditor = async (
  agency: AgencyContext,
  flowSettings: FlowInput
): Promise<void> => {
  console.log(
    `Summary editor is generating a summary report of type '${flowSettings.products.report}'...`
  );

  const { id: agencyId } = agency;

  const summaries = await Summaries.list({ agencyId });

  const { title, lede, body } = await integratedEditor(summaries);

  const signals = await Signals.list({ agencyId });

  const report: Report = {
    id: `${agencyId}-${flowSettings.products.report}-${Date.now()}`,
    title,
    lede,
    body,
    type: flowSettings.products.report,
    author: "editor.integrated",
    sources: signals,
    posterUrl: null,
    factors: flowSettings.factors,
    agency: agencyId,
  };

  const writtenReport = await Reports.write(report);

  await artDirectorQueue.add("artdirector.image.report", {
    agencyId,
    content: writtenReport,
    flowSettings,
  });

  return;
};

export const runIsolatedEditor = async (
  agency: AgencyContext,
  flowSettings: FlowInput
): Promise<void> => {
  console.log(
    `Summary editor is generating a summary report of type '${flowSettings.products.report}'...`
  );

  const { id: agencyId } = agency;
  const { factors } = flowSettings;

  for await (const factor of factors) {
    const summaries = await Summaries.list({ factor, agencyId });
    const { title, lede, body } = await isolatedEditor(summaries);
    const signals = await Signals.list({ agencyId });
    const report: Report = {
      id: `${agencyId}-${flowSettings.products.report}-${Date.now()}`,
      title,
      lede,
      body,
      type: flowSettings.products.report,
      author: "editor.isolated",
      sources: signals,
      posterUrl: null,
      factors: flowSettings.factors,
      agency: agencyId,
    };

    const writtenReport = await Reports.write(report);

    await artDirectorQueue.add("artdirector.image.report", {
      agencyId,
      content: writtenReport,
      flowSettings,
    });
  }

  return;
};
