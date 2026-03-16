import { describe, it, expect } from "vitest";
import { diffWorkflows, formatDiff } from "../workflow/diff.js";

describe("diffWorkflows", () => {
  it("detects added nodes", () => {
    const source = { nodes: [], connections: {} };
    const target = { nodes: [{ name: "A", type: "n8n-nodes-base.set" }], connections: {} };
    const diff = diffWorkflows(source, target);
    expect(diff.nodesAdded).toHaveLength(1);
    expect(diff.nodesAdded[0]!.name).toBe("A");
  });

  it("detects removed nodes", () => {
    const source = { nodes: [{ name: "A", type: "n8n-nodes-base.set" }], connections: {} };
    const target = { nodes: [], connections: {} };
    const diff = diffWorkflows(source, target);
    expect(diff.nodesRemoved).toHaveLength(1);
  });

  it("detects changed node parameters", () => {
    const source = { nodes: [{ name: "A", type: "n8n-nodes-base.set", parameters: { a: 1 } }], connections: {} };
    const target = { nodes: [{ name: "A", type: "n8n-nodes-base.set", parameters: { a: 2 } }], connections: {} };
    const diff = diffWorkflows(source, target);
    expect(diff.nodesChanged).toHaveLength(1);
  });

  it("detects added connections", () => {
    const source = {
      nodes: [{ name: "A", type: "t" }, { name: "B", type: "t" }],
      connections: {},
    };
    const target = {
      nodes: [{ name: "A", type: "t" }, { name: "B", type: "t" }],
      connections: { A: { main: [[{ node: "B", type: "main", index: 0 }]] } },
    };
    const diff = diffWorkflows(source, target);
    expect(diff.connectionsAdded).toHaveLength(1);
  });

  it("reports no differences for identical workflows", () => {
    const wf = { nodes: [{ name: "A", type: "t" }], connections: {} };
    const diff = diffWorkflows(wf, wf);
    expect(formatDiff(diff)).toBe("No differences found.");
  });
});
