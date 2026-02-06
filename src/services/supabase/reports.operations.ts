import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Report } from "../../core";
import { supabase } from ".";

interface ReportFilters {
  type?: string;
  agencyId?: string;
}

export const Reports = {
  list: async (filters?: ReportFilters): Promise<Report[]> => {
    let query = supabase
      .from(process.env.REPORTS_TABLE as string)
      .select("*");

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.agencyId) {
      query = query.eq("agency", filters.agencyId);
    }

    const { data, error }: PostgrestResponse<Report> = await query;

    if (error) throw new Error(error.message);
    return data || [];
  },
  get: async (reportId: number, agencyId?: string): Promise<Report> => {
    let query = supabase
      .from(process.env.REPORTS_TABLE as string)
      .select("*")
      .eq("id", reportId);

    if (agencyId) {
      query = query.eq("agency", agencyId);
    }

    const { data, error }: PostgrestSingleResponse<Report> = await query.single();

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
