import { readFileSync } from "node:fs";
import type { Command } from "commander";
import { N8nClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { diffWorkflows, formatDiff } from "../workflow/diff.js";
import { output } from "../output.js";

type JsonObject = Record<string, unknown>;

async function resolveSource(ref: string, client: N8nClient): Promise<JsonObject> {
  if (ref.startsWith("remote:")) {
    const id = ref.slice("remote:".length);
    return client.getWorkflow(id) as Promise<JsonObject>;
  }

  const content = readFileSync(ref, "utf8");
  return JSON.parse(content) as JsonObject;
}

export function registerDiff(program: Command): void {
  program
    .command("diff <source> <target>")
    .description("Compare two workflows (file path or remote:<id>)")
    .action(async (source: string, target: string) => {
      const opts = program.opts();
      const config = resolveConfig(opts);
      const client = new N8nClient(config);

      const sourceWorkflow = await resolveSource(source, client);
      const targetWorkflow = await resolveSource(target, client);

      const result = diffWorkflows(sourceWorkflow, targetWorkflow);

      if (config.json) {
        output(result, true);
      } else {
        console.log(formatDiff(result));
      }
    });
}
