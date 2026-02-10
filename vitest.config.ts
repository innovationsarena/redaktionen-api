import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["src/test/setup.ts"],
    env: {
      API_KEY: "test-admin-key",
      HASH_SECRET: "test-hash-secret",
      SUPABASE_URL: "http://localhost:54321",
      SUPABASE_KEY: "test-supabase-key",
      AGENCIES_TABLE: "agencies",
      AGENTS_TABLE: "agents",
      SIGNALS_TABLE: "signals",
      SOURCES_TABLE: "sources",
      SUMMARIES_TABLE: "summaries",
      REPORTS_TABLE: "reports",
      REDIS_HOST: "localhost",
      REDIS_USERNAME: "",
      REDIS_PASSWORD: "",
    },
  },
});
