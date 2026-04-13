import { artDirectorQueue } from "../artdirector/artdirector.worker";
import { integratedEditor, isolatedEditor } from "./editor.agent";
import {
  Context,
  Report,
  Signals,
  Reports,
  Summaries,
  AgencyContext,
} from "../../core";
import { editorQueue } from "./editor.worker";

export const checkAndTriggerEditor = async (
  agencyId: string,
  context: Context
) => {
  const signals = await Signals.list({ agencyId });
  const summaries = await Summaries.list({ agencyId });

  console.log(summaries.length + " / " + signals.length + " summaries done");

  if (signals.length === summaries.length) {
    // When all summaries are done

    await productSwitch(agencyId, context);
  }
};

async function productSwitch(agencyId: string, context: Context) {
  const { products } = context;

  // Report
  switch (products.report) {
    case "integrated":
      await editorQueue.add("editor.report.integrated", {
        agencyId,
        context,
      });
      break;

    case "isolated":
      await editorQueue.add("editor.report.isolated", {
        agencyId,
        context,
      });
      break;
  }
  // Foresight
  switch (products.foresight) {
    case "integrated":
      console.log("foresight.integrated");
      break;
    case "isolated":
      console.log("foresight.isolated");
      break;
    case "disabled":
      console.log("foresight.disabled");
      break;
  }
  // Analysis
  switch (products.analysis) {
    case "integrated":
      console.log("analysis.integrated");
      break;
    case "isolated":
      console.log("analysis.isolated");
      break;
    case "disabled":
      console.log("analysis.disabled");
      break;
  }
}

export const runIntegratedEditor = async (
  agencyId: string,
  context: Context
): Promise<void> => {
  console.log(
    `Summary editor is generating a summary report of type '${context.products.report}'...`
  );

  const summaries = await Summaries.list({ agencyId });

  const { title, lede, body } = await integratedEditor(summaries);

  const signals = await Signals.list({ agencyId });

  const report: Report = {
    id: `${agencyId}-${context.products.report}-${Date.now()}`,
    title,
    lede,
    body,
    type: context.products.report,
    author: "editor.integrated",
    sources: signals,
    posterUrl: null,
    factors: context.factors,
    agency: agencyId,
  };

  const writtenReport = await Reports.write(report);

  await artDirectorQueue.add("artdirector.image.report", {
    agencyId,
    content: writtenReport,
    context,
  });

  console.log("Report delivered.");

  return;
};

export const runIsolatedEditor = async (
  agency: AgencyContext,
  context: Context
): Promise<void> => {
  console.log(
    `Summary editor is generating a summary report of type '${context.products.report}'...`
  );

  const { id: agencyId } = agency;
  const { factors } = context;

  for await (const factor of factors) {
    const summaries = await Summaries.list({ factor, agencyId });
    const { title, lede, body } = await isolatedEditor(summaries);
    const signals = await Signals.list({ agencyId });
    const report: Report = {
      id: `${agencyId}-${context.products.report}-${Date.now()}`,
      title,
      lede,
      body,
      type: context.products.report,
      author: "editor.isolated",
      sources: signals,
      posterUrl: null,
      factors: context.factors,
      agency: agencyId,
    };

    const writtenReport = await Reports.write(report);

    await artDirectorQueue.add("artdirector.image.report", {
      agencyId,
      content: writtenReport,
      context,
    });
  }

  console.log("Report delivered.");

  return;
};
