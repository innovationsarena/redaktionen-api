import { Agency, Agent, Source, Signal, Summary, Report } from "../../core/types";

// Auth helpers
export const ADMIN_KEY = "test-admin-key";
export const AGENCY_KEY = "gr-testkey1";

export const adminHeaders = {
  authorization: `Bearer ${ADMIN_KEY}`,
};

export const agencyHeaders = {
  authorization: `Bearer ${AGENCY_KEY}`,
};

// Fixtures

export function makeAgency(overrides: Partial<Agency> = {}): Agency {
  return {
    id: "agency1",
    name: "Test Agency",
    description: "A test agency",
    owner: "test-owner",
    private_key: "hashed-key-123",
    state: "idle",
    ...overrides,
  };
}

export function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent1",
    type: "tipster",
    name: "Test Agent",
    description: "A test agent",
    agency: "agency1",
    avatarUrl: null,
    llm: { provider: "openai", model: "gpt-4" },
    angle: "political",
    prompt: null,
    ...overrides,
  };
}

export function makeSource(overrides: Partial<Source> = {}): Source {
  return {
    id: 1,
    agency: "agency1",
    source: "SVT",
    type: "rss",
    url: "https://svt.se/rss.xml",
    factor: "political",
    ...overrides,
  };
}

export function makeSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: 1,
    title: "Test Signal",
    summary: "A test signal summary",
    source: "SVT",
    agency: "agency1",
    sourceUrl: "https://svt.se/article/1",
    date: "2025-01-01T00:00:00Z",
    factor: "political",
    ...overrides,
  };
}

export function makeSummary(overrides: Partial<Summary> = {}): Summary {
  return {
    id: 1,
    title: "Test Summary",
    body: "A test summary body",
    agency: "agency1",
    posterUrl: null,
    signalId: 1,
    sourceUrl: "https://svt.se/article/1",
    factor: "political",
    date: "2025-01-01T00:00:00Z",
    scope: "global",
    ...overrides,
  };
}

export function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    id: "report1",
    title: "Test Report",
    lede: "A test lede",
    body: "A test report body",
    author: "Summary editor",
    agency: "agency1",
    posterUrl: null,
    type: "summary",
    factors: ["political"],
    sources: [makeSignal()],
    ...overrides,
  };
}
