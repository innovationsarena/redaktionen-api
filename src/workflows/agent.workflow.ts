import { Agency, Factor } from "../core";

export const createDefaultAgents = async (agency: Agency): Promise<void> => {
  console.log("Generating default agents...");

  const factors: Factor[] = [
    "political",
    "economic",
    "social",
    "technological",
    "environmental",
    "legal",
  ];

  for await (const factor of factors) {
    // Correspondents
    await generateCorespondent(factor, agency);
  }

  // Editor
  await generateEditor(agency);

  // Artdirector
  await generateArtdirector(agency);

  return;
};

async function generateCorespondent(factor: Factor, agency: Agency) {
  // 1. generate name + bio
  // 2. write to db
}

async function generateEditor(agency: Agency) {
  // 1. generate name + bio
  // 2. write to db
}

async function generateArtdirector(agency: Agency) {
  // 1. generate name + bio
  // 2. write to db
}
