import { readFileSync, writeFileSync } from "node:fs";
import type { Command } from "commander";
import { decompileWorkflow } from "../workflow/decompile.js";
import { resolveConfig } from "../config.js";

export function registerDecompile(program: Command): void {
  program
    .command("decompile <jsonFile>")
    .description("Convert a workflow JSON to TypeScript")
    .option("-o, --output <file>", "Output file path")
    .action(async (jsonFile: string, cmdOpts: { output?: string }) => {
      const opts = program.opts();
      const config = resolveConfig(opts);

      const content = readFileSync(jsonFile, "utf8");
      const workflow = JSON.parse(content) as Record<string, unknown>;
      const ts = decompileWorkflow(workflow);

      if (cmdOpts.output) {
        writeFileSync(cmdOpts.output, ts);
        if (!config.json) {
          console.log(`Wrote ${cmdOpts.output}`);
        }
      } else {
        process.stdout.write(ts);
      }
    });
}
