import type { Command } from "commander";
import { N8nClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { output } from "../output.js";

export function registerList(program: Command): void {
  program
    .command("list")
    .description("List all workflows")
    .action(async () => {
      const opts = program.opts();
      const config = resolveConfig(opts);
      const client = new N8nClient(config);

      const workflows = await client.listWorkflows();

      const rows = workflows.map((w) => ({
        id: String(w.id ?? ""),
        name: String(w.name ?? ""),
        active: String(w.active ?? false),
        updatedAt: String(w.updatedAt ?? ""),
      }));

      output(rows, config.json, ["id", "name", "active", "updatedAt"]);
    });
}
