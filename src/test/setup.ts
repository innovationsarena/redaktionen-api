import { vi } from "vitest";

// Mock @supabase/supabase-js before anything imports it
vi.mock("@supabase/supabase-js", () => {
  class MockSupabaseClient {
    from() { return this; }
    select() { return this; }
    insert() { return this; }
    update() { return this; }
    delete() { return this; }
    eq() { return this; }
    single() { return Promise.resolve({ data: null, error: null }); }
  }
  return {
    SupabaseClient: MockSupabaseClient,
    createClient: vi.fn(),
  };
});

// Mock bullmq to prevent Redis connections
vi.mock("bullmq", () => {
  const mockQueue = {
    add: vi.fn().mockResolvedValue({}),
    upsertJobScheduler: vi.fn().mockResolvedValue({}),
    removeJobScheduler: vi.fn().mockResolvedValue({}),
  };

  return {
    Queue: vi.fn().mockImplementation(() => mockQueue),
    Worker: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      close: vi.fn(),
    })),
    QueueEvents: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      close: vi.fn(),
    })),
  };
});
