import { z } from "zod";

export const SourceTypeSchema = z.enum(["rss", "url"]);
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

export const SourceSchema = z.object({
  id: z.number().optional(),
  organizationId: z.string().optional(),
  source: z.string(),
  type: SourceTypeSchema,
  url: z.string(),
  factor: FactorSchema,
});
export type Source = z.infer<typeof SourceSchema>;

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

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  owner: z.string(),
  private_key: z.string(),
  public_key: z.string().optional(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const OrganizationInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  owner: z.string(),
});
export type OrganizationInput = z.infer<typeof OrganizationInputSchema>;
