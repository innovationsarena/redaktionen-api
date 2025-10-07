import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Signal } from "../core/types";

export const supabase = new SupabaseClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

export const signals = {
  list: async (factor?: string): Promise<Signal[]> => {
    console.log(factor);
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
