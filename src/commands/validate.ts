import { readFileSync } from "node:fs";
import type { Command } from "commander";
import { validateWorkflow } from "../workflow/validate.js";
import { resolveConfig } from "../config.js";
import { output } from "../output.js";

export function registerValidate(program: Command): void {
  program
    .command("validate <file>")
    .description("Validate a workflow JSON file")
    .option("--rules <rules>", "Comma-separated list of rules to check")
    .action(async (file: string, cmdOpts: { rules?: string }) => {
      const opts = program.opts();
      const config = resolveConfig(opts);

      const content = readFileSync(file, "utf8");
      const workflow = JSON.parse(content) as Record<string, unknown>;

      const rules = cmdOpts.rules?.split(",").map((r) => r.trim());
      const issues = validateWorkflow(workflow, rules);

      if (config.json) {
        output(issues, true);
      } else {
        if (issues.length === 0) {
          console.log("No issues found.");
        } else {
          for (const issue of issues) {
            const prefix = issue.severity === "error" ? "ERROR" : "WARN";
            const path = issue.path ? ` (${issue.path})` : "";
            console.log(`[${prefix}] ${issue.rule}: ${issue.message}${path}`);
          }
        }
      }

      const hasErrors = issues.some((i) => i.severity === "error");
      if (hasErrors) {
        process.exit(1);
      }
    });
}
