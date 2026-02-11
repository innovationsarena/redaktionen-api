import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../helpers/app";
import { makeAgency } from "../helpers/fixtures";

vi.mock("../../core/services/supabase/agencies.operations", () => ({
  Agencies: {
    list: vi.fn(),
    get: vi.fn(),
    getByApiKey: vi.fn(),
    write: vi.fn(),
    update: vi.fn(),
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

const mockedAgencies = vi.mocked(Agencies);

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedAgencies.getByApiKey.mockResolvedValue(makeAgency());
});

describe("POST /webhooks", () => {
  it("returns 400 without ?key= query param", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/webhooks",
      payload: { data: "test" },
    });

    expect(res.statusCode).toBe(400);
  });

  it("returns 200 with valid key", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/webhooks?key=valid-key",
      payload: { data: "test" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ message: "Webhook triggered." });
  });

  it("returns 401 with invalid key", async () => {
    mockedAgencies.getByApiKey.mockRejectedValue(new Error("Not found"));

    const res = await app.inject({
      method: "POST",
      url: "/webhooks?key=invalid-key",
      payload: { data: "test" },
    });

    expect(res.statusCode).toBe(500);
  });
});
