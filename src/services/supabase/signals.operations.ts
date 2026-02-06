import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Signal } from "../../core";
import { supabase } from ".";

interface SignalFilters {
  factor?: string;
  agencyId?: string;
}

export const Signals = {
  list: async (filters?: SignalFilters): Promise<Signal[]> => {
    let query = supabase
      .from(process.env.SIGNALS_TABLE as string)
      .select("*");

    if (filters?.factor) {
      query = query.eq("factor", filters.factor);
    }
    if (filters?.agencyId) {
      query = query.eq("agency", filters.agencyId);
    }

    const { data, error }: PostgrestResponse<Signal> = await query;

    if (error) throw new Error(error.message);
    return data;
  },
  get: async (signalId: number, agencyId?: string): Promise<Signal> => {
    let query = supabase
      .from(process.env.SIGNALS_TABLE as string)
      .select("*")
      .eq("id", signalId);

    if (agencyId) {
      query = query.eq("agency", agencyId);
    }

    const { data, error }: PostgrestSingleResponse<Signal> = await query.single();

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
