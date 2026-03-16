import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

type JsonObject = Record<string, unknown>;

export async function compileWorkflow(tsFilePath: string): Promise<JsonObject> {
  const absolutePath = resolve(tsFilePath);
  const fileUrl = pathToFileURL(absolutePath).href;

  // Dynamic import — tsx must be available in the runtime for TS files
  const mod = await import(fileUrl);
  const workflow = mod.default;

  if (!workflow || typeof workflow !== "object") {
    throw new Error(`File ${tsFilePath} must export a default workflow object.`);
  }

  return workflow as JsonObject;
}
