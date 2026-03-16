import { describe, it, expect } from "vitest";
import { formatTable, formatJson } from "../output.js";

describe("formatTable", () => {
  it("formats rows as aligned table", () => {
    const rows = [
      { id: "1", name: "Workflow A" },
      { id: "22", name: "B" },
    ];
    const result = formatTable(rows, ["id", "name"]);
    expect(result).toContain("id");
    expect(result).toContain("Workflow A");
    expect(result).toContain("--");
  });

  it("returns (no results) for empty array", () => {
    expect(formatTable([], ["id"])).toBe("(no results)");
  });
});

describe("formatJson", () => {
  it("pretty-prints JSON", () => {
    expect(formatJson({ a: 1 })).toBe('{\n  "a": 1\n}');
  });
});
