import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Signal, Summary } from "../core";

export const supabase = new SupabaseClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

export const emptySignals = async () => {
  const { data, error } = await supabase
    .from(process.env.SIGNALS_TABLE as string)
    .delete()
    .neq("id", 0);

  if (error) throw new Error(error.message);

  return;
};

export const emptySummaries = async () => {
  const { data, error } = await supabase
    .from(process.env.SUMMARIES_TABLE as string)
    .delete()
    .neq("id", 0);

  if (error) throw new Error(error.message);

  return;
};

export const signals = {
  list: async (factor?: string): Promise<Signal[]> => {
    if (factor) {
      const { data, error }: PostgrestResponse<Signal> = await supabase
        .from(process.env.SIGNALS_TABLE as string)
        .select("*")
        .eq("factor", factor);

      if (error) throw new Error(error.message);

      return data;
    } else {
      const { data, error }: PostgrestResponse<Signal> = await supabase
        .from(process.env.SIGNALS_TABLE as string)
        .select("*");

      if (error) throw new Error(error.message);

      return data;
    }
  },

  write: async (signal: Signal): Promise<Signal> => {
    const { data, error }: PostgrestSingleResponse<Signal> = await supabase
      .from(process.env.SIGNALS_TABLE as string)
      .insert(signal)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  batchWrite: async (signals: Signal[]): Promise<Signal[]> => {
    const { data, error }: PostgrestResponse<Signal> = await supabase
      .from(process.env.SIGNALS_TABLE as string)
      .insert([...signals])
      .select();

    if (error) throw new Error(error.message);
    return data;
  },
};

export const summaries = {
  write: async (summary: Summary): Promise<Summary> => {
    const { data, error }: PostgrestSingleResponse<Summary> = await supabase
      .from(process.env.SUMMARIES_TABLE as string)
      .insert(summary)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  update: async (summary: Summary): Promise<Summary> => {
    const { data, error }: PostgrestSingleResponse<Summary> = await supabase
      .from(process.env.SUMMARIES_TABLE as string)
      .update(summary)
      .eq("id", summary.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
