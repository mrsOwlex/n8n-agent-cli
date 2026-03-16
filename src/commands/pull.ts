import { writeFileSync } from "node:fs";
import type { Command } from "commander";
import { N8nClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { normalizeWorkflow } from "../workflow/normalize.js";

export function registerPull(program: Command): void {
  program
    .command("pull <id>")
    .description("Download a workflow as JSON")
    .option("-o, --output <file>", "Output file path")
    .option("--strip", "Strip volatile fields (id, timestamps, versionId, hash)")
    .action(async (id: string, cmdOpts: { output?: string; strip?: boolean }) => {
      const opts = program.opts();
      const config = resolveConfig(opts);
      const client = new N8nClient(config);

      const workflow = await client.getWorkflow(id) as Record<string, unknown>;
      const json = normalizeWorkflow(workflow, cmdOpts.strip ?? false);

      if (cmdOpts.output) {
        writeFileSync(cmdOpts.output, json);
        if (!config.json) {
          console.log(`Wrote ${cmdOpts.output}`);
        }
      } else {
        process.stdout.write(json);
      }
    });
}
