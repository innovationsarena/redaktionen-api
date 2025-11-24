import { z } from "zod";

export const SourceTypeSchema = z.enum(["rss", "newsletter"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const FactorSchema = z.enum([
  "political",
  "economic",
  "social",
  "technological",
  "environmental",
  "legal",
]);
export type Factor = z.infer<typeof FactorSchema>;

export const PerspectiveSchema = z.enum([
  "utopia",
  "dystopia",
  "reform",
  "system",
  "speculative",
  "historic",
]);
export type Perspective = z.infer<typeof PerspectiveSchema>;

export const AgentTypeSchema = z.enum([
  "tipster",
  "correspondent",
  "artdirector",
  "analysts",
  "editor",
  "foresighter",
]);
export type AgentType = z.infer<typeof AgentTypeSchema>;

export const SourceSchema = z.object({
  id: z.number().optional(),
  agencyId: z.string().optional(),
  source: z.string(),
  type: SourceTypeSchema,
  url: z.string(),
  factor: FactorSchema,
});
export type Source = z.infer<typeof SourceSchema>;

export const SourceInputSchema = z.object({
  agencyId: z.string().optional(),
  source: z.string(),
  type: SourceTypeSchema,
  url: z.string(),
  factor: FactorSchema,
});
export type SourceInput = z.infer<typeof SourceInputSchema>;

export const AgentSchema = z.object({
  id: z.string(),
  type: AgentTypeSchema,
  name: z.string(),
  description: z.string(),
  avatarUrl: z.string().nullable(),
  agencyId: z.string().optional(),
  llm: z
    .object({
      provider: z.string(),
      model: z.string(),
    })
    .nullable(),
  angle: z
    .union([PerspectiveSchema, FactorSchema])
    .describe("Factor or Perspective depending on Agent type."),
  prompt: z.string().nullable(),
});
export type Agent = z.infer<typeof AgentSchema>;

export const AgentInputSchema = z.object({
  id: z.string().optional(),
  type: AgentTypeSchema,
  name: z.string(),
  description: z.string(),
  agencyId: z.string().optional(),
  llm: z
    .object({
      provider: z.string(),
      model: z.string(),
    })
    .nullable(),
  angle: z
    .union([PerspectiveSchema, FactorSchema])
    .describe("Factor or Perspective depending on Agent type."),
  prompt: z.string().nullable(),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;

export const StatsSchema = z.object({
  tokens: z.number(),
  signals: z.number(),
  summaries: z.number(),
});
export type Stats = z.infer<typeof StatsSchema>;

export const RSSItemSchema = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string(),
  creator: z.string(),
  content: z.string(),
  contentSnippet: z.string(),
  guid: z.string().optional(),
  categories: z.array(z.string()),
  isoDate: z.string(),
});
export type RSSItem = z.infer<typeof RSSItemSchema>;

export const TipsterItemSchema = z.object({
  factor: FactorSchema,
  sources: z.array(SourceSchema),
});
export type TipsterItem = z.infer<typeof TipsterItemSchema>;

export const RSSFeedSchema = z.object({
  feedUrl: z.string(),
  title: z.string(),
  description: z.string(),
  link: z.string(),
  items: z.array(RSSItemSchema),
});
export type RSSFeed = z.infer<typeof RSSFeedSchema>;

export const SignalSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  summary: z.string(),
  source: z.string(),
  sourceUrl: z.string(),
  date: z.string(),
  factor: FactorSchema,
});
export type Signal = z.infer<typeof SignalSchema>;

export const SummarySchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  body: z.string(),
  posterUrl: z.string().nullable(), // string or null
  signalId: z.number(),
  sourceUrl: z.string(),
  factor: z.string(),
  date: z.string(),
  scope: z.string(),
});
export type Summary = z.infer<typeof SummarySchema>;

export const SummaryInputSchema = z.object({
  title: z.string(),
  body: z.string(),
  scope: z.enum(["global", "eu", "sweden"]),
});
export type SummaryInput = z.infer<typeof SummaryInputSchema>;

export const AgencySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  owner: z.string(),
  private_key: z.string(),
});
export type Agency = z.infer<typeof AgencySchema>;

export const AgencyInputSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  owner: z.string(),
});
export type AgencyInput = z.infer<typeof AgencyInputSchema>;

export const WorkflowInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  factors: z.array(FactorSchema),
  foresight: z.boolean(),
  analysts: z.boolean(),
  tipLimit: z.number(),
});
export type WorkflowInput = z.infer<typeof WorkflowInputSchema>;

export const ReportSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  lede: z.string(),
  body: z.string(),
  author: z.string(),
  posterUrl: z.string().nullable(),
  type: z.enum(["summary", "foresight", "analysis"]),
  factors: z.array(FactorSchema).optional(),
  perspective: PerspectiveSchema.optional(),
  sources: z.array(SignalSchema),
});
export type Report = z.infer<typeof ReportSchema>;

export const ReportInputSchema = z.object({
  title: z.string(),
  lede: z.string(),
  body: z.string(),
});
export type ReportInput = z.infer<typeof ReportInputSchema>;
