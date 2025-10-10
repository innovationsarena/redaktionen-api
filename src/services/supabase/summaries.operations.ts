import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import {
  Organization,
  OrganizationInput,
  Signal,
  Source,
  Summary,
} from "../../core";

export const supabase = new SupabaseClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

export const summaries = {
  list: async (): Promise<Summary[]> => {
    const { data, error }: PostgrestResponse<Summary> = await supabase
      .from(process.env.SUMMARIES_TABLE as string)
      .select("*");

    if (error) throw new Error(error.message);
    return data;
  },
  get: async (summaryId: number): Promise<Summary> => {
    const { data, error }: PostgrestSingleResponse<Summary> = await supabase
      .from(process.env.SUMMARIES_TABLE as string)
      .select("*")
      .eq("id", summaryId)
      .single();

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

export const emptySummaries = async () => {
  const { data, error } = await supabase
    .from(process.env.SUMMARIES_TABLE as string)
    .delete()
    .neq("id", 0);

  if (error) throw new Error(error.message);

  return;
};
