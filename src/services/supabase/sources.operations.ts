import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Source } from "../../core";
import { supabase } from ".";

interface SourceFilters {
  factor?: string;
  agencyId?: string;
}

export const Sources = {
  list: async (filters?: SourceFilters): Promise<Source[]> => {
    let query = supabase
      .from(process.env.SOURCES_TABLE as string)
      .select("*");

    if (filters?.factor) {
      query = query.eq("factor", filters.factor);
    }
    if (filters?.agencyId) {
      query = query.eq("agency", filters.agencyId);
    }

    const { data, error }: PostgrestResponse<Source> = await query;

    if (error) throw new Error(error.message);
    return data || [];
  },
  get: async (sourceId: number, agencyId?: string): Promise<Source> => {
    let query = supabase
      .from(process.env.SOURCES_TABLE as string)
      .select("*")
      .eq("id", sourceId);

    if (agencyId) {
      query = query.eq("agency", agencyId);
    }

    const { data, error }: PostgrestSingleResponse<Source> = await query.single();

    if (error) throw new Error(error.message);
    return data;
  },
  write: async (source: Source): Promise<Source> => {
    const { data, error }: PostgrestSingleResponse<Source> = await supabase
      .from(process.env.SOURCES_TABLE as string)
      .insert(source)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  batchWrite: async (sources: Source[]): Promise<Source[]> => {
    const { data, error }: PostgrestResponse<Source> = await supabase
      .from(process.env.SOURCES_TABLE as string)
      .insert([...sources])
      .select();

    if (error) throw new Error(error.message);
    return data;
  },
  update: async (source: Source): Promise<Source> => {
    const { data, error }: PostgrestSingleResponse<Source> = await supabase
      .from(process.env.SOURCES_TABLE as string)
      .update(source)
      .eq("id", source.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  delete: async (sourceId: number, agencyId?: string): Promise<Source> => {
    let query = supabase
      .from(process.env.SOURCES_TABLE as string)
      .delete()
      .eq("id", sourceId);

    if (agencyId) {
      query = query.eq("agency", agencyId);
    }

    const { data, error }: PostgrestSingleResponse<Source> = await query
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
