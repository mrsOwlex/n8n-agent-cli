import { writeFileSync } from "node:fs";
import type { Command } from "commander";
import { compileWorkflow } from "../workflow/compile.js";
import { normalizeWorkflow } from "../workflow/normalize.js";
import { resolveConfig } from "../config.js";

export function registerCompile(program: Command): void {
  program
    .command("compile <tsFile>")
    .description("Compile a TypeScript workflow definition to JSON")
    .option("-o, --output <file>", "Output file path")
    .action(async (tsFile: string, cmdOpts: { output?: string }) => {
      const opts = program.opts();
      const config = resolveConfig(opts);

      const workflow = await compileWorkflow(tsFile);
      const json = normalizeWorkflow(workflow as Record<string, unknown>, false);

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
