import {
  PostgrestSingleResponse,
  PostgrestResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Summary } from "../..";

export const supabase = new SupabaseClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

interface SummaryFilters {
  factor?: string;
  agencyId?: string;
}

export const Summaries = {
  list: async (filters?: SummaryFilters): Promise<Summary[]> => {
    let query = supabase
      .from(process.env.SUMMARIES_TABLE as string)
      .select("*");

    if (filters?.factor) {
      query = query.eq("factor", filters.factor);
    }
    if (filters?.agencyId) {
      query = query.eq("agency", filters.agencyId);
    }

    const { data, error }: PostgrestResponse<Summary> = await query;

    if (error) throw new Error(error.message);
    return data || [];
  },
  get: async (summaryId: number, agencyId?: string): Promise<Summary> => {
    let query = supabase
      .from(process.env.SUMMARIES_TABLE as string)
      .select("*")
      .eq("id", summaryId);

    if (agencyId) {
      query = query.eq("agency", agencyId);
    }

    const { data, error }: PostgrestSingleResponse<Summary> =
      await query.single();

    if (error) throw new Error(error.message);
    return data;
  },
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
    const { id, ...fields } = summary;
    const { data, error }: PostgrestSingleResponse<Summary> = await supabase
      .from(process.env.SUMMARIES_TABLE as string)
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  empty: async (agencyId: string) => {
    const { data, error } = await supabase
      .from(process.env.SUMMARIES_TABLE as string)
      .delete()
      .eq("agency", agencyId);

    if (error) throw new Error(error.message);

    return;
  },
};
