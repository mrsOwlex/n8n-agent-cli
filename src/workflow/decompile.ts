import { getFactoryName } from "./node-map.js";

type JsonObject = Record<string, unknown>;

interface WorkflowNode {
  name: string;
  type: string;
  typeVersion?: number;
  position?: [number, number];
  parameters?: JsonObject;
}

interface Connection {
  node: string;
  type: string;
  index: number;
}

export function decompileWorkflow(workflow: JsonObject): string {
  const nodes = (workflow.nodes ?? []) as WorkflowNode[];
  const connections = (workflow.connections ?? {}) as Record<string, Record<string, Connection[][]>>;
  const settings = workflow.settings as JsonObject | undefined;
  const name = workflow.name as string | undefined;

  const lines: string[] = [];

  lines.push('import { WorkflowBuilder, node } from "./workflow-sdk.js";');
  lines.push("");
  lines.push("const builder = new WorkflowBuilder();");
  lines.push("");

  if (name) {
    lines.push(`builder.setName(${JSON.stringify(name)});`);
    lines.push("");
  }

  if (settings && Object.keys(settings).length > 0) {
    lines.push(`builder.setSettings(${JSON.stringify(settings, null, 2)});`);
    lines.push("");
  }

  // Generate node declarations
  const varNames = new Map<string, string>();

  for (const n of nodes) {
    const varName = toVarName(n.name, varNames);
    varNames.set(n.name, varName);

    const factory = getFactoryName(n.type);
    const params: string[] = [];

    if (n.parameters && Object.keys(n.parameters).length > 0) {
      params.push(`parameters: ${JSON.stringify(n.parameters, null, 2)}`);
    }

    if (n.typeVersion !== undefined && n.typeVersion !== 1) {
      params.push(`typeVersion: ${n.typeVersion}`);
    }

    if (n.position) {
      params.push(`position: [${n.position[0]}, ${n.position[1]}]`);
    }

    if (factory) {
      const opts = params.length > 0 ? `{ ${params.join(", ")} }` : "";
      lines.push(`const ${varName} = builder.addNode(${JSON.stringify(n.name)}, ${JSON.stringify(factory)}, ${opts || "{}"});`);
    } else {
      params.unshift(`type: ${JSON.stringify(n.type)}`);
      lines.push(`const ${varName} = builder.addNode(${JSON.stringify(n.name)}, "generic", { ${params.join(", ")} });`);
    }
  }

  lines.push("");

  // Generate connections
  for (const [sourceName, outputs] of Object.entries(connections)) {
    for (const [outputType, branches] of Object.entries(outputs)) {
      for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
        const targets = branches[branchIndex];
        if (!targets) continue;

        for (const target of targets) {
          const sourceVar = varNames.get(sourceName) ?? JSON.stringify(sourceName);
          const targetVar = varNames.get(target.node) ?? JSON.stringify(target.node);
          const opts: string[] = [];

          if (outputType !== "main") {
            opts.push(`outputType: ${JSON.stringify(outputType)}`);
          }
          if (branchIndex > 0) {
            opts.push(`outputIndex: ${branchIndex}`);
          }
          if (target.index > 0) {
            opts.push(`inputIndex: ${target.index}`);
          }

          const optsStr = opts.length > 0 ? `, { ${opts.join(", ")} }` : "";
          lines.push(`builder.connect(${sourceVar}, ${targetVar}${optsStr});`);
        }
      }
    }
  }

  lines.push("");
  lines.push("export default builder.build();");
  lines.push("");

  return lines.join("\n");
}

function toVarName(nodeName: string, existing: Map<string, string>): string {
  let base = nodeName
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .replace(/^(\d)/, "_$1");

  if (!base) base = "node";

  // camelCase
  base = base.charAt(0).toLowerCase() + base.slice(1);

  let candidate = base;
  let counter = 2;

  while ([...existing.values()].includes(candidate)) {
    candidate = `${base}${counter}`;
    counter++;
  }

  return candidate;
}
