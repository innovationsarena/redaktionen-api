import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../helpers/app";
import {
  adminHeaders,
  agencyHeaders,
  makeAgency,
  makeSummary,
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
import { Summaries } from "../../core/services/supabase/summaries.operations";

const mockedAgencies = vi.mocked(Agencies);
const mockedSummaries = vi.mocked(Summaries);

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

describe("GET /summaries", () => {
  it("returns 400 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/summaries" });
    expect(res.statusCode).toBe(400);
  });

  it("returns summaries with agency scoping", async () => {
    mockedSummaries.list.mockResolvedValue([makeSummary()]);

    const res = await app.inject({
      method: "GET",
      url: "/summaries",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSummaries.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: "agency1" })
    );
    expect(res.json()).toHaveLength(1);
  });

  it("filters by ?factor= query param", async () => {
    mockedSummaries.list.mockResolvedValue([]);

    await app.inject({
      method: "GET",
      url: "/summaries?factor=economic",
      headers: adminHeaders,
    });

    expect(mockedSummaries.list).toHaveBeenCalledWith(
      expect.objectContaining({ factor: "economic" })
    );
  });

  it("with admin key — no agency filter", async () => {
    mockedSummaries.list.mockResolvedValue([]);

    await app.inject({
      method: "GET",
      url: "/summaries",
      headers: adminHeaders,
    });

    expect(mockedSummaries.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: undefined })
    );
  });
});

describe("GET /summaries/:summary", () => {
  it("returns summary by ID, agency scoped", async () => {
    mockedSummaries.get.mockResolvedValue(makeSummary());

    const res = await app.inject({
      method: "GET",
      url: "/summaries/1",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSummaries.get).toHaveBeenCalledWith("1", "agency1");
  });

  it("with admin key — no agency scope", async () => {
    mockedSummaries.get.mockResolvedValue(makeSummary());

    const res = await app.inject({
      method: "GET",
      url: "/summaries/1",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSummaries.get).toHaveBeenCalledWith("1", undefined);
  });

  it("handles not found", async () => {
    mockedSummaries.get.mockRejectedValue(new Error("Not found"));

    const res = await app.inject({
      method: "GET",
      url: "/summaries/999",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(500);
  });
});
