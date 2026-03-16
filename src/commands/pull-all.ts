import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import { N8nClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { normalizeWorkflow } from "../workflow/normalize.js";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").slice(0, 100);
}

export function registerPullAll(program: Command): void {
  program
    .command("pull-all")
    .description("Download all workflows as JSON files")
    .option("-d, --dir <dir>", "Output directory", "workflows")
    .option("--strip", "Strip volatile fields")
    .action(async (cmdOpts: { dir: string; strip?: boolean }) => {
      const opts = program.opts();
      const config = resolveConfig(opts);
      const client = new N8nClient(config);

      const workflows = await client.listWorkflows();
      mkdirSync(cmdOpts.dir, { recursive: true });

      let count = 0;
      for (const summary of workflows) {
        const id = String(summary.id ?? "");
        const name = String(summary.name ?? "workflow");
        const workflow = await client.getWorkflow(id) as Record<string, unknown>;
        const json = normalizeWorkflow(workflow, cmdOpts.strip ?? false);
        const filename = `${sanitizeFilename(name)}_${id}.json`;
        writeFileSync(join(cmdOpts.dir, filename), json);
        count++;
      }

      if (!config.json) {
        console.log(`Pulled ${count} workflows into ${cmdOpts.dir}/`);
      } else {
        console.log(JSON.stringify({ pulled: count, dir: cmdOpts.dir }));
      }
    });
}
