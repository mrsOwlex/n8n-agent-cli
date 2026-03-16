import { describe, it, expect } from "vitest";
import { validateWorkflow } from "../workflow/validate.js";

describe("validateWorkflow", () => {
  it("reports missing nodes array", () => {
    const issues = validateWorkflow({ connections: {} }, ["required-fields"]);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.rule).toBe("required-fields");
  });

  it("reports missing connections", () => {
    const issues = validateWorkflow({ nodes: [] }, ["required-fields"]);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.message).toContain("connections");
  });

  it("passes with valid structure", () => {
    const issues = validateWorkflow({ nodes: [], connections: {} }, ["required-fields"]);
    expect(issues).toHaveLength(0);
  });

  it("detects broken connection targets", () => {
    const workflow = {
      nodes: [{ name: "A", type: "n8n-nodes-base.webhook" }],
      connections: {
        A: { main: [[{ node: "B", type: "main", index: 0 }]] },
      },
    };
    const issues = validateWorkflow(workflow, ["no-broken-connections"]);
    expect(issues.some((i) => i.message.includes('"B"'))).toBe(true);
  });

  it("detects broken connection sources", () => {
    const workflow = {
      nodes: [{ name: "B", type: "n8n-nodes-base.set" }],
      connections: {
        A: { main: [[{ node: "B", type: "main", index: 0 }]] },
      },
    };
    const issues = validateWorkflow(workflow, ["no-broken-connections"]);
    expect(issues.some((i) => i.message.includes('"A"'))).toBe(true);
  });

  it("warns about potential secrets", () => {
    const workflow = {
      nodes: [
        {
          name: "HTTP",
          type: "n8n-nodes-base.httpRequest",
          parameters: {
            headerParameters: {
              values: [{ name: "Authorization", value: "Bearer sk-abcdefghijklmnopqrstuvwxyz123456" }],
            },
          },
        },
      ],
      connections: {},
    };
    const issues = validateWorkflow(workflow, ["no-hardcoded-secrets"]);
    expect(issues.some((i) => i.rule === "no-hardcoded-secrets")).toBe(true);
  });
});
