import type { Command } from "commander";
import { N8nClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { output } from "../output.js";
import { EXIT_SUCCESS, EXIT_VALIDATION, EXIT_RUNTIME } from "../exit-codes.js";

export function registerCheck(program: Command): void {
  program
    .command("check <executionId>")
    .description("Check execution status (exit 0=success, 1=validation, 2=runtime error)")
    .action(async (executionId: string) => {
      const opts = program.opts();
      const config = resolveConfig(opts);
      const client = new N8nClient(config);

      const execution = await client.getExecution(executionId);
      const status = String(execution.status ?? "unknown");

      if (config.json) {
        output({ executionId, status }, true);
      } else {
        console.log(`Execution ${executionId}: ${status}`);
      }

      switch (status) {
        case "success":
          process.exit(EXIT_SUCCESS);
          break;
        case "waiting":
        case "running":
        case "new":
          process.exit(EXIT_VALIDATION);
          break;
        default:
          process.exit(EXIT_RUNTIME);
      }
    });
}
