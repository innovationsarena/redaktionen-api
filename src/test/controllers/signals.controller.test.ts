import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../helpers/app";
import {
  adminHeaders,
  agencyHeaders,
  makeAgency,
  makeSignal,
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

vi.mock("../../core/services/supabase/signals.operations", () => ({
  Signals: {
    list: vi.fn(),
    get: vi.fn(),
    write: vi.fn(),
    batchWrite: vi.fn(),
    empty: vi.fn(),
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
import { Signals } from "../../core/services/supabase/signals.operations";

const mockedAgencies = vi.mocked(Agencies);
const mockedSignals = vi.mocked(Signals);

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

describe("GET /signals", () => {
  it("returns 400 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/signals" });
    expect(res.statusCode).toBe(400);
  });

  it("returns signals with agency scoping", async () => {
    mockedSignals.list.mockResolvedValue([makeSignal()]);

    const res = await app.inject({
      method: "GET",
      url: "/signals",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSignals.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: "agency1" })
    );
    expect(res.json()).toHaveLength(1);
  });

  it("filters by ?factor= query param", async () => {
    mockedSignals.list.mockResolvedValue([]);

    await app.inject({
      method: "GET",
      url: "/signals?factor=economic",
      headers: adminHeaders,
    });

    expect(mockedSignals.list).toHaveBeenCalledWith(
      expect.objectContaining({ factor: "economic" })
    );
  });

  it("with admin key — no agency filter", async () => {
    mockedSignals.list.mockResolvedValue([]);

    await app.inject({
      method: "GET",
      url: "/signals",
      headers: adminHeaders,
    });

    expect(mockedSignals.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: undefined })
    );
  });
});

describe("GET /signals/:signalId", () => {
  it("returns signal by ID, agency scoped", async () => {
    mockedSignals.get.mockResolvedValue(makeSignal());

    const res = await app.inject({
      method: "GET",
      url: "/signals/1",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSignals.get).toHaveBeenCalledWith("1", "agency1");
  });

  it("with admin key — no agency scope", async () => {
    mockedSignals.get.mockResolvedValue(makeSignal());

    const res = await app.inject({
      method: "GET",
      url: "/signals/1",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSignals.get).toHaveBeenCalledWith("1", undefined);
  });

  it("handles not found", async () => {
    mockedSignals.get.mockRejectedValue(new Error("Not found"));

    const res = await app.inject({
      method: "GET",
      url: "/signals/999",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(500);
  });
});
