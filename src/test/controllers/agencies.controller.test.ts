import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../helpers/app";
import { adminHeaders, makeAgency } from "../helpers/fixtures";

// Mock the supabase operations
vi.mock("../../core/services/supabase/agencies.operations", () => ({
  Agencies: {
    list: vi.fn(),
    get: vi.fn(),
    getByApiKey: vi.fn(),
    write: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock the summaries operations (has its own SupabaseClient)
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
  createHash: vi.fn().mockResolvedValue("hashed-key-123"),
}));

vi.mock("../../core/utils/id.utils", () => ({
  id: vi.fn().mockReturnValue("testid01"),
}));

// Mock services (queues)
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
import { agentQueue, tipsterQueue } from "../../services";

const mockedAgencies = vi.mocked(Agencies);
const mockedAgentQueue = vi.mocked(agentQueue);
const mockedTipsterQueue = vi.mocked(tipsterQueue);

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /agencies", () => {
  it("returns 401 without auth header", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/agencies",
      payload: { name: "Test", owner: "owner" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 with wrong API key", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/agencies",
      headers: { authorization: "Bearer wrong-key" },
      payload: { name: "Test", owner: "owner" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("creates agency and returns apiKey starting with gr-", async () => {
    mockedAgencies.write.mockResolvedValue(makeAgency());

    const res = await app.inject({
      method: "POST",
      url: "/agencies",
      headers: adminHeaders,
      payload: {
        name: "Test Agency",
        owner: "test-owner",
        state: "idle",
        defaultAgents: false,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.apiKey).toMatch(/^gr-/);
  });

  it("calls Agencies.write with hashed key", async () => {
    mockedAgencies.write.mockResolvedValue(makeAgency());

    await app.inject({
      method: "POST",
      url: "/agencies",
      headers: adminHeaders,
      payload: {
        name: "Test Agency",
        owner: "test-owner",
        state: "idle",
        defaultAgents: false,
      },
    });

    expect(mockedAgencies.write).toHaveBeenCalledWith(
      expect.objectContaining({
        private_key: "hashed-key-123",
      })
    );
  });

  it("calls agentQueue.add when defaultAgents is true", async () => {
    mockedAgencies.write.mockResolvedValue(makeAgency());

    await app.inject({
      method: "POST",
      url: "/agencies",
      headers: adminHeaders,
      payload: {
        name: "Test Agency",
        owner: "test-owner",
        state: "idle",
        defaultAgents: true,
      },
    });

    expect(mockedAgentQueue.add).toHaveBeenCalledWith(
      "agent.createDefault",
      expect.any(Object)
    );
  });

  it("skips queue when defaultAgents is false", async () => {
    mockedAgencies.write.mockResolvedValue(makeAgency());

    await app.inject({
      method: "POST",
      url: "/agencies",
      headers: adminHeaders,
      payload: {
        name: "Test Agency",
        owner: "test-owner",
        state: "idle",
        defaultAgents: false,
      },
    });

    expect(mockedAgentQueue.add).not.toHaveBeenCalled();
  });
});

describe("GET /agencies", () => {
  it("returns 401 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/agencies" });
    expect(res.statusCode).toBe(401);
  });

  it("returns sanitized list", async () => {
    mockedAgencies.list.mockResolvedValue([
      makeAgency(),
      makeAgency({ id: "agency2", name: "Agency 2" }),
    ]);

    const res = await app.inject({
      method: "GET",
      url: "/agencies",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(2);
    expect(body[0]).toEqual({
      id: "agency1",
      name: "Test Agency",
      description: "A test agency",
    });
    // Ensure private_key is not exposed
    expect(body[0]).not.toHaveProperty("private_key");
  });

  it("returns empty array when no agencies", async () => {
    mockedAgencies.list.mockResolvedValue([]);

    const res = await app.inject({
      method: "GET",
      url: "/agencies",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });
});

describe("GET /agencies/:agencyId", () => {
  it("returns 401 without auth", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/agencies/agency1",
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns sanitized agency", async () => {
    mockedAgencies.get.mockResolvedValue(makeAgency());

    const res = await app.inject({
      method: "GET",
      url: "/agencies/agency1",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toEqual({
      id: "agency1",
      name: "Test Agency",
      description: "A test agency",
    });
  });

  it("handles not found", async () => {
    mockedAgencies.get.mockRejectedValue(new Error("Not found"));

    const res = await app.inject({
      method: "GET",
      url: "/agencies/nonexistent",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(500);
  });
});

describe("PUT /agencies/:agencyId", () => {
  it("returns 401 without auth", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/agencies/agency1",
      payload: { name: "Updated" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("updates and preserves id and private_key", async () => {
    const original = makeAgency();
    mockedAgencies.get.mockResolvedValue(original);
    mockedAgencies.update.mockResolvedValue(
      makeAgency({ name: "Updated Agency" })
    );

    const res = await app.inject({
      method: "PUT",
      url: "/agencies/agency1",
      headers: adminHeaders,
      payload: {
        name: "Updated Agency",
        owner: "new-owner",
        state: "running",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(mockedAgencies.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "agency1",
        private_key: "hashed-key-123",
      })
    );
  });

  it("handles not found", async () => {
    mockedAgencies.get.mockRejectedValue(new Error("Not found"));

    const res = await app.inject({
      method: "PUT",
      url: "/agencies/nonexistent",
      headers: adminHeaders,
      payload: { name: "Updated", owner: "owner", state: "idle" },
    });

    expect(res.statusCode).toBe(500);
  });
});

describe("PATCH /agencies/:agencyId/key", () => {
  it("returns 401 without auth", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/agencies/agency1/key",
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns new apiKey", async () => {
    mockedAgencies.get.mockResolvedValue(makeAgency());
    mockedAgencies.update.mockResolvedValue(makeAgency());

    const res = await app.inject({
      method: "PATCH",
      url: "/agencies/agency1/key",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.apiKey).toMatch(/^gr-/);
  });

  it("calls Agencies.update with new hashed key", async () => {
    mockedAgencies.get.mockResolvedValue(makeAgency());
    mockedAgencies.update.mockResolvedValue(makeAgency());

    await app.inject({
      method: "PATCH",
      url: "/agencies/agency1/key",
      headers: adminHeaders,
    });

    expect(mockedAgencies.update).toHaveBeenCalledWith(
      expect.objectContaining({
        private_key: "hashed-key-123",
      })
    );
  });
});

describe("POST /agencies/:agencyId/start", () => {
  const validPayload = {
    factors: ["political"],
    products: { report: "integrated" },
    interval: 24,
  };

  it("returns 401 without auth", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/agencies/agency1/start",
      payload: validPayload,
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 with invalid body (missing factors)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/agencies/agency1/start",
      headers: adminHeaders,
      payload: { products: { report: "integrated" } },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("Bad Request");
  });

  it("returns 400 with invalid factor value", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/agencies/agency1/start",
      headers: adminHeaders,
      payload: {
        factors: ["invalid-factor"],
        products: { report: "integrated" },
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it("returns 400 with missing products", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/agencies/agency1/start",
      headers: adminHeaders,
      payload: { factors: ["political"] },
    });

    expect(res.statusCode).toBe(400);
  });

  it("updates state to running and adds queue jobs", async () => {
    mockedAgencies.get.mockResolvedValue(makeAgency());
    mockedAgencies.update.mockResolvedValue(makeAgency({ state: "running" }));

    const res = await app.inject({
      method: "POST",
      url: "/agencies/agency1/start",
      headers: adminHeaders,
      payload: validPayload,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedAgencies.update).toHaveBeenCalledWith(
      expect.objectContaining({ state: "running" })
    );
    expect(mockedTipsterQueue.add).toHaveBeenCalledWith(
      "tipster.start",
      expect.any(Object)
    );
    expect(mockedTipsterQueue.upsertJobScheduler).toHaveBeenCalled();
  });

  it("applies defaults for optional fields", async () => {
    mockedAgencies.get.mockResolvedValue(makeAgency());
    mockedAgencies.update.mockResolvedValue(makeAgency({ state: "running" }));

    const res = await app.inject({
      method: "POST",
      url: "/agencies/agency1/start",
      headers: adminHeaders,
      payload: {
        factors: ["political"],
        products: { report: "integrated" },
      },
    });

    expect(res.statusCode).toBe(200);
    // Default interval is 24
    expect(res.json().message).toContain("24");
    expect(mockedTipsterQueue.upsertJobScheduler).toHaveBeenCalledWith(
      "agency-interval-schema",
      { every: 1000 * 60 * 60 * 24 }
    );
  });

  it("message includes agency name and interval", async () => {
    mockedAgencies.get.mockResolvedValue(makeAgency({ name: "My Agency" }));
    mockedAgencies.update.mockResolvedValue(makeAgency({ state: "running" }));

    const res = await app.inject({
      method: "POST",
      url: "/agencies/agency1/start",
      headers: adminHeaders,
      payload: {
        factors: ["political"],
        products: { report: "integrated" },
        interval: 12,
      },
    });

    const body = res.json();
    expect(body.message).toContain("My Agency");
    expect(body.message).toContain("12");
  });
});
