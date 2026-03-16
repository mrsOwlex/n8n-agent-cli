import { describe, it, expect } from "vitest";
import { decompileWorkflow } from "../workflow/decompile.js";

describe("decompileWorkflow", () => {
  it("generates valid TypeScript for a simple webhook workflow", () => {
    const workflow = {
      name: "Test Workflow",
      nodes: [
        { name: "Webhook Trigger", type: "n8n-nodes-base.webhook", parameters: { path: "test" } },
        { name: "Respond to Webhook", type: "n8n-nodes-base.respondToWebhook", parameters: {} },
      ],
      connections: {
        "Webhook Trigger": {
          main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]],
        },
      },
    };

    const ts = decompileWorkflow(workflow);
    expect(ts).toContain("WorkflowBuilder");
    expect(ts).toContain('"Webhook Trigger"');
    expect(ts).toContain('"webhook"');
    expect(ts).toContain("builder.connect(");
    expect(ts).toContain("export default builder.build()");
  });

  it("uses generic factory for unknown node types", () => {
    const workflow = {
      nodes: [{ name: "Custom", type: "n8n-nodes-base.unknownThing", parameters: {} }],
      connections: {},
    };

    const ts = decompileWorkflow(workflow);
    expect(ts).toContain('"generic"');
    expect(ts).toContain("n8n-nodes-base.unknownThing");
  });
});
