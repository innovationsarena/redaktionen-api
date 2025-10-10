import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Source } from "../../core";
import { supabase } from ".";

export const Sources = {
  list: async (factor?: string): Promise<Source[]> => {
    let items: Source[] = [];

    if (factor) {
      const { data, error }: PostgrestResponse<Source> = await supabase
        .from(process.env.SOURCES_TABLE as string)
        .select("*")
        .eq("factor", factor);

      if (data) {
        items = [...data];
      }

      if (error) throw new Error(error.message);
    } else {
      const { data, error }: PostgrestResponse<Source> = await supabase
        .from(process.env.SOURCES_TABLE as string)
        .select("*");

      items = data || [];
    }

    return items;
  },
  get: async (sourceId: number): Promise<Source> => {
    const { data, error }: PostgrestSingleResponse<Source> = await supabase
      .from(process.env.SOURCES_TABLE as string)
      .select("*")
      .eq("id", sourceId)
      .single();

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
};
