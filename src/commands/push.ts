import { readFileSync } from "node:fs";
import type { Command } from "commander";
import { N8nClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { output } from "../output.js";

export function registerPush(program: Command): void {
  program
    .command("push <file>")
    .description("Upload/update a workflow from a JSON file")
    .option("--id <id>", "Target workflow ID (updates existing)")
    .option("--create", "Create a new workflow")
    .option("--activate", "Activate after push")
    .option("--deactivate", "Deactivate after push")
    .option("--dry-run", "Show what would be done without executing")
    .action(async (file: string, cmdOpts: { id?: string; create?: boolean; activate?: boolean; deactivate?: boolean; dryRun?: boolean }) => {
      const opts = program.opts();
      const config = resolveConfig(opts);
      const client = new N8nClient(config);
      const dryRun = config.dryRun || cmdOpts.dryRun;

      const content = readFileSync(file, "utf8");
      const workflow = JSON.parse(content) as Record<string, unknown>;

      const workflowId = cmdOpts.id ?? (workflow.id ? String(workflow.id) : undefined);

      if (!cmdOpts.create && !workflowId) {
        console.error("No workflow ID. Use --id <id> or --create to create a new workflow.");
        process.exit(1);
      }

      if (cmdOpts.create) {
        if (dryRun) {
          console.log(`[dry-run] Would create workflow: ${workflow.name ?? "(unnamed)"}`);
          return;
        }

        const result = await client.createWorkflow(workflow);
        const newId = String((result as Record<string, unknown>).id ?? "");

        if (cmdOpts.activate) {
          await client.activateWorkflow(newId);
        }

        output(result, config.json);
        return;
      }

      if (dryRun) {
        console.log(`[dry-run] Would update workflow ${workflowId}`);
        return;
      }

      const result = await client.updateWorkflow(workflowId!, workflow);

      if (cmdOpts.activate) {
        await client.activateWorkflow(workflowId!);
      } else if (cmdOpts.deactivate) {
        await client.deactivateWorkflow(workflowId!);
      }

      output(result, config.json);
    });
}
