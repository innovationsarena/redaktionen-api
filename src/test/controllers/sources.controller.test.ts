import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../helpers/app";
import {
  adminHeaders,
  agencyHeaders,
  makeAgency,
  makeSource,
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

vi.mock("../../core/services/supabase/sources.operations", () => ({
  Sources: {
    list: vi.fn(),
    get: vi.fn(),
    write: vi.fn(),
    batchWrite: vi.fn(),
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
import { Sources } from "../../core/services/supabase/sources.operations";

const mockedAgencies = vi.mocked(Agencies);
const mockedSources = vi.mocked(Sources);

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

describe("GET /sources", () => {
  it("returns 400 without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/sources" });
    expect(res.statusCode).toBe(400);
  });

  it("returns sources with agency scoping", async () => {
    mockedSources.list.mockResolvedValue([makeSource()]);

    const res = await app.inject({
      method: "GET",
      url: "/sources",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSources.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: "agency1" })
    );
    expect(res.json()).toHaveLength(1);
  });

  it("filters by ?factor= query param", async () => {
    mockedSources.list.mockResolvedValue([]);

    await app.inject({
      method: "GET",
      url: "/sources?factor=economic",
      headers: adminHeaders,
    });

    expect(mockedSources.list).toHaveBeenCalledWith(
      expect.objectContaining({ factor: "economic" })
    );
  });

  it("with admin key — no agency filter", async () => {
    mockedSources.list.mockResolvedValue([]);

    await app.inject({
      method: "GET",
      url: "/sources",
      headers: adminHeaders,
    });

    expect(mockedSources.list).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: undefined })
    );
  });
});

describe("POST /sources", () => {
  const sourcePayload = {
    source: "SVT",
    type: "rss",
    url: "https://svt.se/rss.xml",
    factor: "political",
  };

  it("returns 400 if admin key without agency in body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/sources",
      headers: adminHeaders,
      payload: sourcePayload,
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("Bad Request");
  });

  it("creates source with agency key", async () => {
    mockedSources.write.mockResolvedValue(makeSource());

    const res = await app.inject({
      method: "POST",
      url: "/sources",
      headers: agencyHeaders,
      payload: sourcePayload,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSources.write).toHaveBeenCalledWith(
      expect.objectContaining({ agency: "agency1" })
    );
  });

  it("creates source with admin key + agency in body", async () => {
    mockedSources.write.mockResolvedValue(makeSource());

    const res = await app.inject({
      method: "POST",
      url: "/sources",
      headers: adminHeaders,
      payload: { ...sourcePayload, agency: "agency1" },
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSources.write).toHaveBeenCalledWith(
      expect.objectContaining({ agency: "agency1" })
    );
  });
});

describe("GET /sources/:sourceId", () => {
  it("returns source by ID, agency scoped", async () => {
    mockedSources.get.mockResolvedValue(makeSource());

    const res = await app.inject({
      method: "GET",
      url: "/sources/1",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSources.get).toHaveBeenCalledWith("1", "agency1");
  });

  it("with admin key — no agency scope", async () => {
    mockedSources.get.mockResolvedValue(makeSource());

    const res = await app.inject({
      method: "GET",
      url: "/sources/1",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSources.get).toHaveBeenCalledWith("1", undefined);
  });

  it("handles not found", async () => {
    mockedSources.get.mockRejectedValue(new Error("Not found"));

    const res = await app.inject({
      method: "GET",
      url: "/sources/999",
      headers: adminHeaders,
    });

    expect(res.statusCode).toBe(500);
  });
});

describe("DELETE /sources/:sourceId", () => {
  it("deletes source, agency scoped", async () => {
    mockedSources.delete.mockResolvedValue(makeSource());

    const res = await app.inject({
      method: "DELETE",
      url: "/sources/1",
      headers: agencyHeaders,
    });

    expect(res.statusCode).toBe(200);
    expect(mockedSources.delete).toHaveBeenCalledWith("1", "agency1");
  });

  it("with admin key — no agency scope", async () => {
    mockedSources.delete.mockResolvedValue(makeSource());

    await app.inject({
      method: "DELETE",
      url: "/sources/1",
      headers: adminHeaders,
    });

    expect(mockedSources.delete).toHaveBeenCalledWith("1", undefined);
  });
});
