import { Agent, AgentInput } from "../../core";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { supabase } from ".";

export const Agents = {
  list: async (): Promise<Agent[]> => {
    const { data, error }: PostgrestResponse<Agent> = await supabase
      .from(process.env.AGENTS_TABLE as string)
      .select("*");

    if (error) throw new Error(error.message);
    return data;
  },
  get: async (agentId: string): Promise<Agent> => {
    const { data, error }: PostgrestSingleResponse<Agent> = await supabase
      .from(process.env.AGENTS_TABLE as string)
      .select("*")
      .eq("id", agentId)
      .single();

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
  delete: async (agentId: string): Promise<Agent> => {
    const { data, error }: PostgrestSingleResponse<Agent> = await supabase
      .from(process.env.AGENTS_TABLE as string)
      .delete()
      .eq("id", agentId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
