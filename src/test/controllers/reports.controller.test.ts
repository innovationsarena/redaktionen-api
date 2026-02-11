import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../helpers/app";
import {
  adminHeaders,
  agencyHeaders,
  makeAgency,
  makeReport,
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

vi.mock("../../core/services/supabase/reports.operations", () => ({
  Reports: {
    list: vi.fn(),
    get: vi.fn(),
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
import { Reports } from "../../core/services/supabase/reports.operations";

const mockedAgencies = vi.mocked(Agencies);
const mockedReports = vi.mocked(Reports);

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

describe("GET /reports", () => {
  it("returns 400 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/reports" });
    expect(res.statusCode).toBe(400);
  });

  it("returns reports with agency scoping", async () => {
    mockedReports.list.mockResolvedValue([makeReport()]);

    const res = await app.inject({
      method: "GET",
      url: "/reports",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedReports.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: "agency1" })
    );
    expect(res.json()).toHaveLength(1);
  });

  it("filters by ?type= query param", async () => {
    mockedReports.list.mockResolvedValue([]);

    await app.inject({
      method: "GET",
      url: "/reports?type=foresight",
      headers: adminHeaders,
    });

    expect(mockedReports.list).toHaveBeenCalledWith(
      expect.objectContaining({ type: "foresight" })
    );
  });

  it("with admin key — no agency filter", async () => {
    mockedReports.list.mockResolvedValue([]);

    await app.inject({
      method: "GET",
      url: "/reports",
      headers: adminHeaders,
    });

    expect(mockedReports.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: undefined })
    );
  });
});

describe("GET /reports/:reportId", () => {
  it("returns report by ID, agency scoped", async () => {
    mockedReports.get.mockResolvedValue(makeReport());

    const res = await app.inject({
      method: "GET",
      url: "/reports/1",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedReports.get).toHaveBeenCalledWith("1", "agency1");
  });

  it("with admin key — no agency scope", async () => {
    mockedReports.get.mockResolvedValue(makeReport());

    const res = await app.inject({
      method: "GET",
      url: "/reports/1",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedReports.get).toHaveBeenCalledWith("1", undefined);
  });

  it("handles not found", async () => {
    mockedReports.get.mockRejectedValue(new Error("Not found"));

    const res = await app.inject({
      method: "GET",
      url: "/reports/999",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(500);
  });
});
