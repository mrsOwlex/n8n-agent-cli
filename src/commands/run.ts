import type { Command } from "commander";
import { N8nClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { output } from "../output.js";
import { poll } from "../util/poll.js";

function isTerminal(status: string): boolean {
  return ["success", "error", "crashed", "canceled"].includes(status);
}

export function registerRun(program: Command): void {
  program
    .command("run <workflowId>")
    .description("Execute a workflow")
    .option("--async", "Return immediately without waiting")
    .option("--payload <json>", "JSON payload to send")
    .option("--timeout <ms>", "Timeout in milliseconds", "60000")
    .action(async (workflowId: string, cmdOpts: { async?: boolean; payload?: string; timeout?: string }) => {
      const opts = program.opts();
      const config = resolveConfig(opts);
      const client = new N8nClient(config);

      const payload = cmdOpts.payload ? JSON.parse(cmdOpts.payload) as Record<string, unknown> : undefined;

      // Check workflow for webhook nodes to decide trigger strategy
      const workflow = await client.getWorkflow(workflowId) as Record<string, unknown>;
      const nodes = workflow.nodes as Array<Record<string, unknown>> | undefined;
      const webhookNode = nodes?.find((n) => n.type === "n8n-nodes-base.webhook");

      if (webhookNode) {
        // Webhook-based workflow: trigger via production webhook URL
        const params = webhookNode.parameters as Record<string, unknown> | undefined;
        const path = params?.path as string | undefined;

        if (!path) {
          console.error("Webhook node has no path configured.");
          process.exit(2);
        }

        const result = await client.triggerWebhook(path, payload);
        output(result, config.json);
        return;
      }

      // Non-webhook workflow: use execution API
      const execution = await client.runExecution(workflowId, payload);
      const executionId = String(execution.id ?? "");

      if (cmdOpts.async || !executionId) {
        output({ executionId, status: "started" }, config.json);
        return;
      }

      const timeout = parseInt(cmdOpts.timeout ?? "60000", 10);
      const final = await poll(
        () => client.getExecution(executionId),
        (exec) => isTerminal(String(exec.status ?? "")),
        { timeout, interval: 2000 },
      );

      output(final, config.json);
    });
}
