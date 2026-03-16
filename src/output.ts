type JsonObject = Record<string, unknown>;

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function formatTable(rows: JsonObject[], columns: string[]): string {
  if (rows.length === 0) {
    return "(no results)";
  }

  const widths = columns.map((col) =>
    Math.max(col.length, ...rows.map((row) => String(row[col] ?? "").length))
  );

  const header = columns.map((col, i) => col.padEnd(widths[i]!)).join("  ");
  const separator = widths.map((w) => "-".repeat(w)).join("  ");
  const body = rows.map((row) =>
    columns.map((col, i) => String(row[col] ?? "").padEnd(widths[i]!)).join("  ")
  );

  return [header, separator, ...body].join("\n");
}

export function output(data: unknown, json: boolean, columns?: string[]): void {
  if (json) {
    console.log(formatJson(data));
    return;
  }

  if (Array.isArray(data) && columns) {
    console.log(formatTable(data as JsonObject[], columns));
    return;
  }

  console.log(formatJson(data));
}
