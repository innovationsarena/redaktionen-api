import { Agency, Agent, Agents, Factor, id } from "../../core";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import z from "zod";
import { artDirectorQueue } from "../artdirector";

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
    await generateCorrespondent(factor, agency);
  }

  // Editor
  await generateIntegratedEditor(agency);
  await generateIsolatedEditor(agency);

  // Artdirector
  // await generateArtdirector(agency);

  return;
};

async function generateCorrespondent(factor: Factor, agency: Agency) {
  console.log(`Generating correspondent factor '${factor}'.`);

  try {
    // 1. generate name + bio
    const { object } = await generateObject({
      model: openai(
        (process.env.CORRESPONDENT_DEFAULT_MODEL as string) || "gpt-5-mini"
      ),
      system: `Du är en kreativ assistent. När du får en PESTEL-faktor (Political, Economic, Social, Technological, Environmental eller Legal) ska du skapa en liten, rolig och påhittad persona på svenska.
      Personan ska innehålla:
      Namn (för- och efternamn)
      Bio (2-3 meningar)
      Bion ska vara lätt humoristisk, kreativ och tydligt kopplad till den angivna PESTEL-faktorn. Håll texten kort, professionell i tonen men med en subtil komisk twist.
      Svara endast i följande format:
      name: Förnamn Efternamn
      bio: Kort beskrivning i 2-3 meningar.`,
      prompt: `Skapa en persona till faktor: ${factor}.`,
      schema: z.object({ name: z.string(), bio: z.string() }),
    });

    const agent: Agent = {
      id: `${agency.id}-correspondent-${factor}`,
      type: "correspondent",
      name: object.name,
      description: object.bio,
      angle: factor,
      avatarUrl: null,
      agency: agency.id,
      prompt: `
  You are given a HTML code. I want to you collect the information on it and write a summaried article with title and body text in swedish. The summary should be short and clear without loosing any vital information. Set a scope key (global, eu, sweden) depending on the scope of the article. Make sure the title or body doesnt include any backticks.`,
      llm: {
        provider: "openai",
        model: process.env.CORRESPONDENT_DEFAULT_MODEL || "gpt-5-mini",
      },
    };

    await artDirectorQueue.add("artdirector.image.agent", {
      agencyId: agency.id,
      content: agent,
    });

    // 2. write to db
    await Agents.write(agent);
    return;
  } catch (error: any) {
    console.error(error.message);
  }
}

async function generateIntegratedEditor(agency: Agency) {
  // 1. generate name + bio
  console.log(`Generating integrated editor.`);

  const editorIndex = Math.floor(Math.random() * editorBios.length);

  const agent: Agent = {
    id: `${agency.id}-integrated-editor`,
    type: "editor",
    name: editorBios[editorIndex].name,
    description: editorBios[editorIndex].bio,
    angle: "all",
    avatarUrl: null,
    agency: agency.id,
    prompt: `
  # Editorial synthesis prompt for multi-source news summaries

**Role**
- You are a news editor. Turn a list of news summaries into one clear, comprehensive, and accurate report that preserves all important details.

**Goal**
- Produce a concise, neutral, well-structured article that captures who/what/when/where/why/how; integrates names, numbers, dates, locations, titles, key quotes; resolves or clearly presents discrepancies; avoids redundancy/speculation.

**Inputs**
- A list of news summaries from multiple outlets with varying detail and angles.

**Output format**
- Title: Specific, active, informative.
- Lede: (2-3 sentences): The key development and why it matters.
- Body in markdown:
- - Context/Background: Prior events and relevant history.
- - Details/Evidence: Data and statements from stakeholders; attribute where needed.
- - Impact/Implications: Who is affected, scale, next steps.
- - Whats next: Expected actions, deadlines, open questions.
- - Uncertainties/Discrepancies: Whats unknown or contested and by whom.
- - Internal source list (non-public if not required): Outlets and dates used.

**Style and tone**
- Neutral, precise, concise; active voice.
- Present tense for ongoing events; past tense for completed actions.
- Attribute contentious or exclusive claims ("According to [source]…").
- Avoid opinion, speculation, and jargon (or define if essential).

**Process**
1) Extract/map facts: Names, titles, figures, dates/times (with time zones), locations, quotes, attributions.
2) Merge/prioritize: De-duplicate; keep the clearest, most specific version; lead with whats new and consequential; add necessary context.
3) Resolve conflicts: Prefer primary/authoritative sources; if unresolved, present both accounts with attribution and note uncertainty.
4) Ensure completeness without bloat: Include exact numbers, ranges, units/currencies, legal/technical terms that matter; remove repetition; combine related facts.
5) Verify/standardize and final checks: Cross-check numbers/dates/names; standardize units, currency, and time formats; ensure clarity, balance, and accuracy.

**Length**
- As concise as possible while preserving essentials.

**Deliverable**
- Provide the final report in the given output schema written in swedish.
  `,
    llm: {
      provider: "openai",
      model: process.env.EDITOR_DEFAULT_MODEL || "gpt-5",
    },
  };

  await artDirectorQueue.add("artdirector.image.agent", {
    agencyId: agency.id,
    content: agent,
  });

  // 2. write to db
  await Agents.write(agent);
}

async function generateIsolatedEditor(agency: Agency) {
  // 1. generate name + bio
  console.log(`Generating isolated editor.`);

  const editorIndex = Math.floor(Math.random() * editorBios.length);

  const agent: Agent = {
    id: `${agency.id}-isolated-editor`,
    type: "editor",
    name: editorBios[editorIndex].name,
    description: editorBios[editorIndex].bio,
    angle: "all",
    avatarUrl: null,
    agency: agency.id,
    prompt: `
  # Editorial synthesis prompt for multi-source news summaries

**Role**
- You are a news editor. Turn a list of news summaries into one clear, comprehensive, and accurate report that preserves all important details.

**Goal**
- Produce a concise, neutral, well-structured article that captures who/what/when/where/why/how; integrates names, numbers, dates, locations, titles, key quotes; resolves or clearly presents discrepancies; avoids redundancy/speculation.

**Inputs**
- A list of news summaries from multiple outlets with varying detail and angles.

**Output format**
- Title: Specific, active, informative.
- Lede: (2-3 sentences): The key development and why it matters.
- Body in markdown:
- - Context/Background: Prior events and relevant history.
- - Details/Evidence: Data and statements from stakeholders; attribute where needed.
- - Impact/Implications: Who is affected, scale, next steps.
- - Whats next: Expected actions, deadlines, open questions.
- - Uncertainties/Discrepancies: Whats unknown or contested and by whom.
- - Internal source list (non-public if not required): Outlets and dates used.

**Style and tone**
- Neutral, precise, concise; active voice.
- Present tense for ongoing events; past tense for completed actions.
- Attribute contentious or exclusive claims ("According to [source]…").
- Avoid opinion, speculation, and jargon (or define if essential).

**Process**
1) Extract/map facts: Names, titles, figures, dates/times (with time zones), locations, quotes, attributions.
2) Merge/prioritize: De-duplicate; keep the clearest, most specific version; lead with whats new and consequential; add necessary context.
3) Resolve conflicts: Prefer primary/authoritative sources; if unresolved, present both accounts with attribution and note uncertainty.
4) Ensure completeness without bloat: Include exact numbers, ranges, units/currencies, legal/technical terms that matter; remove repetition; combine related facts.
5) Verify/standardize and final checks: Cross-check numbers/dates/names; standardize units, currency, and time formats; ensure clarity, balance, and accuracy.

**Length**
- As concise as possible while preserving essentials.

**Deliverable**
- Provide the final report in the given output schema written in swedish.
  `,
    llm: {
      provider: "openai",
      model: process.env.EDITOR_DEFAULT_MODEL || "gpt-5",
    },
  };

  await artDirectorQueue.add("artdirector.image.agent", {
    agencyId: agency.id,
    content: agent,
  });

  // 2. write to db
  await Agents.write(agent);
  // 2. write to db
}

async function generateArtdirector(agency: Agency) {
  // 1. generate name + bio
  // 2. write to db
}

export const editorBios: { name: string; bio: string }[] = [
  {
    name: "Nova Blix",
    bio: "Kreativ redaktör med känsla för rytm, färg och finurligheter. Förvandlar halvfärdiga idéer till berättelser som glittrar – alltid med en kopp kaffe och ett snett leende nära till hands.",
  },
  {
    name: "Elis Monte",
    bio: "Ordens akrobat som älskar skarpa vinklar och mjuka mellanrum. Klipper, klistrar och polerar tills texten sjunger. Tror stenhårt på att varje mening förtjänar sin stund i rampljuset.",
  },
  {
    name: "Mira Solvind",
    bio: "Redaktör med solsken i tangentbordet. Hittar den röda tråden i det mest färgsprakande kaos och gör den både tydlig och oemotståndlig.",
  },
  {
    name: "Theo Lind",
    bio: "Idéspruta och detaljnörd i perfekt balans. Bygger struktur som ett proffs och kryddar med kreativitet där det behövs som mest.",
  },
  {
    name: "Signe Pixel",
    bio: "Berättararkitekt med hjärta för både ord och bild. Älskar att finslipa formuleringar tills de känns självklara – och lite magiska.",
  },
  {
    name: "Arvid Storm",
    bio: "Snabb i tanken och skarp i pennan. Förvandlar röriga utkast till kristallklara berättelser med både precision och lekfullhet.",
  },
  {
    name: "Luna Ek",
    bio: "Kreativ redaktör som ser möjligheter i varje stycke. Finslipar språk med fingertoppskänsla och en gnutta rebellisk charm.",
  },
  {
    name: "Max Orion",
    bio: "Strukturell mästare med kreativ kompass. Navigerar mellan idé och färdig text med trygg hand och glimten i ögat.",
  },
  {
    name: "Freja Vale",
    bio: "Textens tonsättare som får ord att harmoniera. Älskar tempo, tydlighet och den där sista detaljen som lyfter allt.",
  },
  {
    name: "Noah Glimt",
    bio: "Nyfiken redaktör med passion för berättelser som berör. Skalar bort bruset och låter kärnan ta plats – klart, kreativt och med värme.",
  },
];
