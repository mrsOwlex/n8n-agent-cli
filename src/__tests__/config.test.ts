import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveConfig } from "../config.js";

describe("resolveConfig", () => {
  const origUrl = process.env.N8N_BASE_URL;
  const origKey = process.env.N8N_API_KEY;

  beforeEach(() => {
    process.env.N8N_BASE_URL = "http://localhost:5678";
    process.env.N8N_API_KEY = "test-key";
  });

  afterEach(() => {
    if (origUrl) process.env.N8N_BASE_URL = origUrl;
    else delete process.env.N8N_BASE_URL;
    if (origKey) process.env.N8N_API_KEY = origKey;
    else delete process.env.N8N_API_KEY;
  });

  it("returns config from env", () => {
    const config = resolveConfig({});
    expect(config.baseUrl).toBe("http://localhost:5678");
    expect(config.apiKey).toBe("test-key");
    expect(config.json).toBe(false);
    expect(config.verbose).toBe(false);
  });

  it("respects flags", () => {
    const config = resolveConfig({ json: true, verbose: true, dryRun: true });
    expect(config.json).toBe(true);
    expect(config.verbose).toBe(true);
    expect(config.dryRun).toBe(true);
  });

  it("throws on missing base URL", () => {
    delete process.env.N8N_BASE_URL;
    expect(() => resolveConfig({})).toThrow("Missing N8N_BASE_URL");
  });

  it("throws on missing API key", () => {
    delete process.env.N8N_API_KEY;
    expect(() => resolveConfig({})).toThrow("Missing N8N_API_KEY");
  });
});
