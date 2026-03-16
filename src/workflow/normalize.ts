const VOLATILE_FIELDS = new Set([
  "updatedAt",
  "createdAt",
  "versionId",
  "hash",
]);

const VOLATILE_META_FIELDS = new Set(["instanceId"]);

export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  if (typeof value === "object" && value !== null) {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }

  return value;
}

export function stripVolatile(workflow: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(workflow)) {
    if (key === "id") continue;
    if (VOLATILE_FIELDS.has(key)) continue;

    if (key === "meta" && typeof value === "object" && value !== null) {
      const meta: Record<string, unknown> = {};
      for (const [mk, mv] of Object.entries(value as Record<string, unknown>)) {
        if (!VOLATILE_META_FIELDS.has(mk)) {
          meta[mk] = mv;
        }
      }
      if (Object.keys(meta).length > 0) {
        result[key] = meta;
      }
      continue;
    }

    result[key] = value;
  }

  return result;
}

export function normalizeWorkflow(workflow: Record<string, unknown>, strip: boolean): string {
  const data = strip ? stripVolatile(workflow) : workflow;
  return JSON.stringify(sortKeys(data), null, 2) + "\n";
}
