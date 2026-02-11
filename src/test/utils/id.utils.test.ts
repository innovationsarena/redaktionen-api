import { describe, it, expect } from "vitest";
import { id } from "../../core/utils/id.utils";

describe("id", () => {
  it("generates an 8-character string by default", () => {
    const result = id();
    expect(result).toHaveLength(8);
  });

  it("generates a string of the specified length", () => {
    expect(id(4)).toHaveLength(4);
    expect(id(16)).toHaveLength(16);
    expect(id(32)).toHaveLength(32);
  });

  it("contains only alphanumeric characters", () => {
    for (let i = 0; i < 20; i++) {
      const result = id(16);
      expect(result).toMatch(/^[0-9A-Za-z]+$/);
    }
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => id(8)));
    expect(ids.size).toBe(100);
  });
});
