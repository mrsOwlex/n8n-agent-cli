import { Command } from "commander";
import { registerPing } from "./commands/ping.js";
import { registerList } from "./commands/list.js";
import { registerPull } from "./commands/pull.js";
import { registerPullAll } from "./commands/pull-all.js";
import { registerPush } from "./commands/push.js";
import { registerRun } from "./commands/run.js";
import { registerWait } from "./commands/wait.js";
import { registerCheck } from "./commands/check.js";
import { registerCompile } from "./commands/compile.js";
import { registerDecompile } from "./commands/decompile.js";
import { registerValidate } from "./commands/validate.js";
import { registerDiff } from "./commands/diff.js";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("n8n-agent")
    .description("CLI for coding agents to manage n8n workflows")
    .version("0.1.0")
    .option("--json", "Output as JSON", false)
    .option("--verbose", "Verbose output", false)
    .option("--dry-run", "Dry run (no mutations)", false);

  registerPing(program);
  registerList(program);
  registerPull(program);
  registerPullAll(program);
  registerPush(program);
  registerRun(program);
  registerWait(program);
  registerCheck(program);
  registerCompile(program);
  registerDecompile(program);
  registerValidate(program);
  registerDiff(program);

  return program;
}
