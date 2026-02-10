import { Agency } from "../../core";
import { createDefaultAgents } from "./agent.agent";
import { agentQueue } from "./agent.worker";

export const queueDefaultAgents = async (agency: Agency): Promise<void> => {
  await agentQueue.add("agent.createDefault", agency);
};
