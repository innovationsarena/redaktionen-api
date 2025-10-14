import { Agency, AgencyInput } from "../../core";
import {
  PostgrestError,
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { supabase } from ".";

export const Agencies = {
  list: async (): Promise<Agency[]> => {
    const { data, error }: PostgrestResponse<Agency> = await supabase
      .from(process.env.AGENCIES_TABLE as string)
      .select("*");

    if (error) throw new Error(error.message);
    return data;
  },
  get: async (agencyId: string): Promise<Agency> => {
    const { data, error }: PostgrestSingleResponse<Agency> = await supabase
      .from(process.env.AGENCIES_TABLE as string)
      .select("*")
      .eq("id", agencyId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  getByApiKey: async (
    apiKey: string
  ): Promise<{ data: Agency; error: PostgrestError }> => {
    const { data, error }: PostgrestSingleResponse<Agency> = await supabase
      .from(process.env.AGENCIES_TABLE as string)
      .select("*")
      .eq("private_key", apiKey)
      .single();

    return { data: data as Agency, error: error as PostgrestError };
  },
  write: async (agency: AgencyInput): Promise<Agency> => {
    const { data, error }: PostgrestSingleResponse<Agency> = await supabase
      .from(process.env.AGENCIES_TABLE as string)
      .insert(agency)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  update: async (agency: Agency): Promise<Agency> => {
    const { data, error }: PostgrestSingleResponse<Agency> = await supabase
      .from(process.env.AGENCIES_TABLE as string)
      .update(agency)
      .eq("id", agency.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
