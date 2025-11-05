import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { Report } from "../../core";
import { supabase } from ".";

export const Reports = {
  list: async (type?: string): Promise<Report[]> => {
    let reports: Report[] = [];

    if (type) {
      const { data: filteredData, error }: PostgrestResponse<Report> =
        await supabase
          .from(process.env.REPORTS_TABLE as string)
          .select("*")
          .eq("type", type);

      if (error) throw new Error(error.message);

      reports = [...filteredData];
    } else {
      const { data, error }: PostgrestResponse<Report> = await supabase
        .from(process.env.REPORTS_TABLE as string)
        .select("*");

      if (error) throw new Error(error.message);
      reports = [...data];
    }

    return reports;
  },
  get: async (reportId: number): Promise<Report> => {
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
