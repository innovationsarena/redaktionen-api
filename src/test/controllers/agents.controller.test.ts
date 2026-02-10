import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../helpers/app";
import {
  adminHeaders,
  agencyHeaders,
  makeAgency,
  makeAgent,
  AGENCY_KEY,
} from "../helpers/fixtures";

vi.mock("../../core/services/supabase/agencies.operations", () => ({
  Agencies: {
    list: vi.fn(),
    get: vi.fn(),
    getByApiKey: vi.fn(),
    write: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../../core/services/supabase/agents.operations", () => ({
  Agents: {
    list: vi.fn(),
    get: vi.fn(),
    write: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../core/services/supabase/summaries.operations", () => ({
  supabase: {},
  Summaries: {
    list: vi.fn(),
    get: vi.fn(),
    write: vi.fn(),
    update: vi.fn(),
    empty: vi.fn(),
  },
}));

vi.mock("../../core/utils/crypto.utils", () => ({
  createHash: vi.fn().mockResolvedValue("hashed-agency-key"),
}));

vi.mock("../../core/utils/id.utils", () => ({
  id: vi.fn().mockReturnValue("testid01"),
}));

vi.mock("../../services", () => ({
  agentQueue: { add: vi.fn().mockResolvedValue({}) },
  tipsterQueue: {
    add: vi.fn().mockResolvedValue({}),
    upsertJobScheduler: vi.fn().mockResolvedValue({}),
    removeJobScheduler: vi.fn().mockResolvedValue({}),
  },
  correspondentQueue: { add: vi.fn().mockResolvedValue({}) },
  artDirectorQueue: { add: vi.fn().mockResolvedValue({}) },
  editorQueue: { add: vi.fn().mockResolvedValue({}) },
  runCorrespondents: vi.fn(),
  runTipsters: vi.fn(),
  runEditor: vi.fn(),
  queueDefaultAgents: vi.fn(),
  checkAndTriggerEditor: vi.fn(),
  CORRESPONDENT_QUEUE_NAME: "correspondentQueue",
  ARTDIRECTOR_QUEUE_NAME: "artDirectorQueue",
  TIPSTER_QUEUE_NAME: "tipsterQueue",
  EDITOR_QUEUE_NAME: "editorQueue",
  AGENT_QUEUE_NAME: "agentQueue",
  tipster: vi.fn(),
  summaryEditor: vi.fn(),
  createDefaultAgents: vi.fn(),
}));

import { Agencies } from "../../core/services/supabase/agencies.operations";
import { Agents } from "../../core/services/supabase/agents.operations";
import { artDirectorQueue } from "../../services";

const mockedAgencies = vi.mocked(Agencies);
const mockedAgents = vi.mocked(Agents);
const mockedArtDirectorQueue = vi.mocked(artDirectorQueue);

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  vi.clearAllMocks();
  // Default: agency key resolves to an agency
  mockedAgencies.getByApiKey.mockResolvedValue(makeAgency());
});

describe("GET /agents", () => {
  it("returns 400 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/agents" });
    expect(res.statusCode).toBe(400);
  });

  it("with admin key — no agency filter", async () => {
    const agents = [makeAgent(), makeAgent({ id: "agent2" })];
    mockedAgents.list.mockResolvedValue(agents);

    const res = await app.inject({
      method: "GET",
      url: "/agents",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedAgents.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: undefined })
    );
    expect(res.json()).toHaveLength(2);
  });

  it("with agency key — filters by agency", async () => {
    mockedAgents.list.mockResolvedValue([makeAgent()]);

    const res = await app.inject({
      method: "GET",
      url: "/agents",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedAgents.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: "agency1" })
    );
  });

  it("filters by ?type= query param", async () => {
    mockedAgents.list.mockResolvedValue([makeAgent()]);

    await app.inject({
      method: "GET",
      url: "/agents?type=tipster",
      headers: adminHeaders,
    });

    expect(mockedAgents.list).toHaveBeenCalledWith(
      expect.objectContaining({ type: "tipster" })
    );
  });
});

describe("POST /agents", () => {
  const agentPayload = {
    type: "tipster",
    name: "New Agent",
    description: "A new agent",
    llm: { provider: "openai", model: "gpt-4" },
    angle: "political",
    prompt: null,
  };

  it("returns 400 without auth", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/agents",
      payload: agentPayload,
    });
    expect(res.statusCode).toBe(400);
  });

  it("with agency key — uses authenticated agency ID", async () => {
    mockedAgents.write.mockResolvedValue(makeAgent());

    const res = await app.inject({
      method: "POST",
      url: "/agents",
      headers: agencyHeaders,
      payload: agentPayload,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedAgents.write).toHaveBeenCalledWith(
      expect.objectContaining({ agency: "agency1" })
    );
  });

  it("returns 400 with admin key when agencyId missing from body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/agents",
      headers: adminHeaders,
      payload: agentPayload,
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("Bad Request");
  });

  it("with admin key + agencyId in body", async () => {
    mockedAgents.write.mockResolvedValue(makeAgent());

    const res = await app.inject({
      method: "POST",
      url: "/agents",
      headers: adminHeaders,
      payload: { ...agentPayload, agencyId: "agency1" },
    });

    expect(res.statusCode).toBe(200);
    expect(mockedAgents.write).toHaveBeenCalledWith(
      expect.objectContaining({ agency: "agency1" })
    );
  });

  it("triggers artDirectorQueue.add", async () => {
    mockedAgents.write.mockResolvedValue(makeAgent());

    await app.inject({
      method: "POST",
      url: "/agents",
      headers: agencyHeaders,
      payload: agentPayload,
    });

    expect(mockedArtDirectorQueue.add).toHaveBeenCalledWith(
      "artdirector.image.avatar",
      expect.objectContaining({ agencyId: "agency1" })
    );
  });
});

describe("GET /agents/:agentId", () => {
  it("with agency key (scoped)", async () => {
    mockedAgents.get.mockResolvedValue(makeAgent());

    const res = await app.inject({
      method: "GET",
      url: "/agents/agent1",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedAgents.get).toHaveBeenCalledWith("agent1", "agency1");
  });

  it("with admin key (unscoped)", async () => {
    mockedAgents.get.mockResolvedValue(makeAgent());

    const res = await app.inject({
      method: "GET",
      url: "/agents/agent1",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedAgents.get).toHaveBeenCalledWith("agent1", undefined);
  });

  it("handles not found", async () => {
    mockedAgents.get.mockRejectedValue(new Error("Not found"));

    const res = await app.inject({
      method: "GET",
      url: "/agents/nonexistent",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(500);
  });
});

describe("PATCH /agents/:agentId", () => {
  const updatePayload = {
    type: "tipster",
    name: "Updated Agent",
    description: "Updated",
    llm: { provider: "openai", model: "gpt-4" },
    angle: "political",
    prompt: null,
  };

  it("with agency key: preserves original agency", async () => {
    mockedAgents.get.mockResolvedValue(makeAgent({ agency: "agency1" }));
    mockedAgents.update.mockResolvedValue(makeAgent({ name: "Updated Agent" }));

    await app.inject({
      method: "PATCH",
      url: "/agents/agent1",
      headers: agencyHeaders,
      payload: { ...updatePayload, agencyId: "different-agency" },
    });

    expect(mockedAgents.update).toHaveBeenCalledWith(
      expect.objectContaining({ agency: "agency1" })
    );
  });

  it("with admin key: allows changing agency via body", async () => {
    mockedAgents.get.mockResolvedValue(makeAgent({ agency: "agency1" }));
    mockedAgents.update.mockResolvedValue(
      makeAgent({ agency: "new-agency" })
    );

    await app.inject({
      method: "PATCH",
      url: "/agents/agent1",
      headers: adminHeaders,
      payload: { ...updatePayload, agencyId: "new-agency" },
    });

    expect(mockedAgents.update).toHaveBeenCalledWith(
      expect.objectContaining({ agency: "new-agency" })
    );
  });
});

describe("DELETE /agents/:agentId", () => {
  it("returns deleted agent", async () => {
    const agent = makeAgent();
    mockedAgents.delete.mockResolvedValue(agent);

    const res = await app.inject({
      method: "DELETE",
      url: "/agents/agent1",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ id: "agent1" });
  });

  it("scoped by agency key", async () => {
    mockedAgents.delete.mockResolvedValue(makeAgent());

    await app.inject({
      method: "DELETE",
      url: "/agents/agent1",
      headers: agencyHeaders,
    });

    expect(mockedAgents.delete).toHaveBeenCalledWith("agent1", "agency1");
  });
});
