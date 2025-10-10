import { Organization, OrganizationInput } from "../../core";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { supabase } from ".";

export const organizations = {
  list: async (): Promise<Organization[]> => {
    const { data, error }: PostgrestResponse<Organization> = await supabase
      .from(process.env.ORGANIZATIONS_TABLE as string)
      .select("*");

    if (error) throw new Error(error.message);
    return data;
  },
  get: async (organizationId: string): Promise<Organization> => {
    const { data, error }: PostgrestSingleResponse<Organization> =
      await supabase
        .from(process.env.ORGANIZATIONS_TABLE as string)
        .select("*")
        .eq("id", organizationId)
        .single();

    if (error) throw new Error(error.message);
    return data;
  },
  write: async (organization: OrganizationInput): Promise<Organization> => {
    const { data, error }: PostgrestSingleResponse<Organization> =
      await supabase
        .from(process.env.ORGANIZATIONS_TABLE as string)
        .insert(organization)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
  },
  update: async (organization: Organization): Promise<Organization> => {
    const { data, error }: PostgrestSingleResponse<Organization> =
      await supabase
        .from(process.env.ORGANIZATIONS_TABLE as string)
        .update(organization)
        .eq("id", organization.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
