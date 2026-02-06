import { Agent, AgentInput, AgentType } from "../../core";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { supabase } from ".";

interface AgentFilters {
  type?: AgentType;
  agencyId?: string;
}

export const Agents = {
  list: async (filters?: AgentFilters): Promise<Agent[]> => {
    let query = supabase
      .from(process.env.AGENTS_TABLE as string)
      .select("*");

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.agencyId) {
      query = query.eq("agency", filters.agencyId);
    }

    const { data, error }: PostgrestResponse<Agent> = await query;

    if (error) throw new Error(error.message);
    return data || [];
  },
  get: async (agentId: string, agencyId?: string): Promise<Agent> => {
    let query = supabase
      .from(process.env.AGENTS_TABLE as string)
      .select("*")
      .eq("id", agentId);

    if (agencyId) {
      query = query.eq("agency", agencyId);
    }

    const { data, error }: PostgrestSingleResponse<Agent> = await query.single();

    if (error) throw new Error(error.message);
    return data;
  },
  write: async (agent: AgentInput): Promise<Agent> => {
    const { data, error }: PostgrestSingleResponse<Agent> = await supabase
      .from(process.env.AGENTS_TABLE as string)
      .insert(agent)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  update: async (agent: Agent): Promise<Agent> => {
    const { data, error }: PostgrestSingleResponse<Agent> = await supabase
      .from(process.env.AGENTS_TABLE as string)
      .update(agent)
      .eq("id", agent.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  delete: async (agentId: string, agencyId?: string): Promise<Agent> => {
    let query = supabase
      .from(process.env.AGENTS_TABLE as string)
      .delete()
      .eq("id", agentId);

    if (agencyId) {
      query = query.eq("agency", agencyId);
    }

    const { data, error }: PostgrestSingleResponse<Agent> = await query
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
