import type { Command } from "commander";
import { N8nClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { output } from "../output.js";
import { poll } from "../util/poll.js";

function isTerminal(status: string): boolean {
  return ["success", "error", "crashed", "canceled"].includes(status);
}

export function registerWait(program: Command): void {
  program
    .command("wait <executionId>")
    .description("Wait for an execution to complete")
    .option("--timeout <ms>", "Timeout in milliseconds", "60000")
    .option("--interval <ms>", "Poll interval in milliseconds", "2000")
    .action(async (executionId: string, cmdOpts: { timeout?: string; interval?: string }) => {
      const opts = program.opts();
      const config = resolveConfig(opts);
      const client = new N8nClient(config);

      const timeout = parseInt(cmdOpts.timeout ?? "60000", 10);
      const interval = parseInt(cmdOpts.interval ?? "2000", 10);

      const final = await poll(
        () => client.getExecution(executionId),
        (exec) => isTerminal(String(exec.status ?? "")),
        { timeout, interval },
      );

      output(final, config.json);
    });
}
