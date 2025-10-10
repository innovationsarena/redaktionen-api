import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Signal } from "../../core";
import { supabase } from ".";

export const Signals = {
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
  get: async (signalId: number): Promise<Signal> => {
    const { data, error }: PostgrestSingleResponse<Signal> = await supabase
      .from(process.env.SIGNALS_TABLE as string)
      .select("*")
      .eq("id", signalId)
      .single();

    if (error) throw new Error(error.message);
    return data;
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

export const emptySignals = async () => {
  const { data, error } = await supabase
    .from(process.env.SIGNALS_TABLE as string)
    .delete()
    .neq("id", 0);

  if (error) throw new Error(error.message);

  return;
};
