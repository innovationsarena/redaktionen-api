import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Report } from "../../core";
import { supabase } from ".";

export const Reports = {
  list: async (): Promise<Report[]> => {
    const { data, error }: PostgrestResponse<Report> = await supabase
      .from(process.env.REPORTS_TABLE as string)
      .select("*");

    if (error) throw new Error(error.message);

    return data;
  },
  get: async (reportId: string): Promise<Report> => {
    const { data, error }: PostgrestSingleResponse<Report> = await supabase
      .from(process.env.REPORTS_TABLE as string)
      .select("*")
      .eq("id", reportId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  write: async (report: Report): Promise<Report> => {
    const { data, error }: PostgrestSingleResponse<Report> = await supabase
      .from(process.env.REPORTS_TABLE as string)
      .insert(report)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  update: async (report: Report): Promise<Report> => {
    const { data, error }: PostgrestSingleResponse<Report> = await supabase
      .from(process.env.REPORTS_TABLE as string)
      .update(report)
      .eq("id", report.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
