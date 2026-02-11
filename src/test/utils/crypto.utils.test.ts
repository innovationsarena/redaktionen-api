import { describe, it, expect } from "vitest";
import { createHash } from "../../core/utils/crypto.utils";

describe("createHash", () => {
  it("returns a hex string", async () => {
    const hash = await createHash("test-key");
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("returns a 64-char SHA-256 hex digest", async () => {
    const hash = await createHash("test-key");
    expect(hash).toHaveLength(64);
  });

  it("produces deterministic output", async () => {
    const hash1 = await createHash("same-key");
    const hash2 = await createHash("same-key");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different inputs", async () => {
    const hash1 = await createHash("key-a");
    const hash2 = await createHash("key-b");
    expect(hash1).not.toBe(hash2);
  });
});
