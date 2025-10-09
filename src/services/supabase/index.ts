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

export const emptySignals = async () => {
  const { data, error } = await supabase
    .from(process.env.SIGNALS_TABLE as string)
    .delete()
    .neq("id", 0);

  if (error) throw new Error(error.message);

  return;
};

export const emptySummaries = async () => {
  const { data, error } = await supabase
    .from(process.env.SUMMARIES_TABLE as string)
    .delete()
    .neq("id", 0);

  if (error) throw new Error(error.message);

  return;
};

export const signals = {
  list: async (factor?: string): Promise<Signal[]> => {
    if (factor) {
      const { data, error }: PostgrestResponse<Signal> = await supabase
        .from(process.env.SIGNALS_TABLE as string)
        .select("*")
        .eq("factor", factor);

      if (error) throw new Error(error.message);

      return data;
    } else {
      const { data, error }: PostgrestResponse<Signal> = await supabase
        .from(process.env.SIGNALS_TABLE as string)
        .select("*");

      if (error) throw new Error(error.message);

      return data;
    }
  },
  get: async (signalId: number): Promise<Signal> => {
    const { data, error }: PostgrestSingleResponse<Signal> = await supabase
      .from(process.env.SIGNALS_TABLE as string)
      .select("*")
      .eq("id", signalId)
      .single();

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

export const sources = {
  list: async (organizationId?: string, factor?: string): Promise<Source[]> => {
    let items: Source[] = [];

    if (organizationId) {
      const { data, error }: PostgrestResponse<Source> = await supabase
        .from(process.env.SOURCES_TABLE as string)
        .select("*")
        .eq("organizationId", organizationId);

      if (data) {
        items = [...data];
      }
      if (error) throw new Error(error.message);
    }

    if (factor) {
      const { data, error }: PostgrestResponse<Source> = await supabase
        .from(process.env.SOURCES_TABLE as string)
        .select("*")
        .eq("factor", factor);

      if (data) {
        items = [...data];
      }

      if (error) throw new Error(error.message);
    }

    if (organizationId && factor) {
      const { data, error }: PostgrestResponse<Source> = await supabase
        .from(process.env.SOURCES_TABLE as string)
        .select("*")
        .eq("organizationId", organizationId)
        .eq("factor", factor);

      if (data) {
        items = [...data];
      }
      if (error) throw new Error(error.message);
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
      .from(process.env.SIGNALS_TABLE as string)
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
