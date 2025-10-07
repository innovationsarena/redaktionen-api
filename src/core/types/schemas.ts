import z from "zod";

export const signalSchema = z.object({
  title: z.string(),
  summary: z.string(),
  source: z.string(),
  sourceUrl: z.string().url(),
  date: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Invalid date format, must be ISO8601",
  }),
  scope: z.enum(["global", "eu", "sweden"]),
});
