import { SupabaseClient } from "@supabase/supabase-js";

export const supabase = new SupabaseClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

// Operations
export * from "./agencies.operations";
export * from "./summaries.operations";
export * from "./sources.operations";
export * from "./signals.operations";
export * from "./reports.operations";
