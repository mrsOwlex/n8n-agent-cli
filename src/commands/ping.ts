import type { Command } from "commander";
import { N8nClient } from "../client.js";
import { resolveConfig } from "../config.js";
import { output } from "../output.js";

export function registerPing(program: Command): void {
  program
    .command("ping")
    .description("Test connection to n8n instance")
    .action(async () => {
      const opts = program.opts();
      const config = resolveConfig(opts);
      const client = new N8nClient(config);

      try {
        await client.ping();
        if (config.json) {
          output({ ok: true, baseUrl: config.baseUrl }, true);
        } else {
          console.log(`Connected to ${config.baseUrl}`);
        }
      } catch (error) {
        if (config.json) {
          output({ ok: false, error: String(error) }, true);
        } else {
          console.error(`Failed to connect to ${config.baseUrl}`);
          console.error(String(error));
        }
        process.exit(1);
      }
    });
}
