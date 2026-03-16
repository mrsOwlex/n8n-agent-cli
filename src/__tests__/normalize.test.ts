import { describe, it, expect } from "vitest";
import { sortKeys, stripVolatile, normalizeWorkflow } from "../workflow/normalize.js";

describe("sortKeys", () => {
  it("sorts object keys alphabetically", () => {
    expect(sortKeys({ b: 1, a: 2 })).toEqual({ a: 2, b: 1 });
  });

  it("sorts nested objects", () => {
    expect(sortKeys({ z: { b: 1, a: 2 }, a: 3 })).toEqual({ a: 3, z: { a: 2, b: 1 } });
  });

  it("handles arrays", () => {
    expect(sortKeys([{ b: 1, a: 2 }])).toEqual([{ a: 2, b: 1 }]);
  });

  it("passes through primitives", () => {
    expect(sortKeys("hello")).toBe("hello");
    expect(sortKeys(42)).toBe(42);
    expect(sortKeys(null)).toBe(null);
  });
});

describe("stripVolatile", () => {
  it("removes id, updatedAt, createdAt, versionId, hash", () => {
    const input = {
      id: "abc",
      name: "Test",
      updatedAt: "2024-01-01",
      createdAt: "2024-01-01",
      versionId: "v1",
      hash: "abc123",
      nodes: [],
    };
    const result = stripVolatile(input);
    expect(result).toEqual({ name: "Test", nodes: [] });
  });

  it("removes meta.instanceId but keeps other meta fields", () => {
    const input = {
      name: "Test",
      meta: { instanceId: "xyz", templateId: "t1" },
    };
    const result = stripVolatile(input);
    expect(result).toEqual({ name: "Test", meta: { templateId: "t1" } });
  });

  it("removes meta entirely if only instanceId", () => {
    const input = {
      name: "Test",
      meta: { instanceId: "xyz" },
    };
    const result = stripVolatile(input);
    expect(result).toEqual({ name: "Test" });
  });
});

describe("normalizeWorkflow", () => {
  it("returns sorted pretty-printed JSON with trailing newline", () => {
    const input = { name: "Test", active: true };
    const result = normalizeWorkflow(input, false);
    expect(result).toBe('{\n  "active": true,\n  "name": "Test"\n}\n');
  });

  it("strips volatile fields when strip=true", () => {
    const input = { name: "Test", id: "123", updatedAt: "2024-01-01" };
    const result = normalizeWorkflow(input, true);
    expect(result).toBe('{\n  "name": "Test"\n}\n');
  });
});
