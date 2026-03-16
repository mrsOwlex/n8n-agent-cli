import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export interface N8nAgentConfig {
  baseUrl: string;
  apiKey: string;
  verbose: boolean;
  json: boolean;
  dryRun: boolean;
}

export function loadDotEnv(cwd: string): void {
  const envPath = resolve(cwd, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = stripQuotes(value);
    }
  }
}

export function resolveConfig(flags: { json?: boolean; verbose?: boolean; dryRun?: boolean }): N8nAgentConfig {
  const baseUrl = process.env.N8N_BASE_URL;

  if (!baseUrl) {
    throw new Error("Missing N8N_BASE_URL. Set it in .env or as an environment variable.");
  }

  const apiKey = process.env.N8N_API_KEY;

  if (!apiKey) {
    throw new Error("Missing N8N_API_KEY. Set it in .env or as an environment variable.");
  }

  return {
    baseUrl,
    apiKey,
    verbose: flags.verbose ?? false,
    json: flags.json ?? false,
    dryRun: flags.dryRun ?? false,
  };
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
