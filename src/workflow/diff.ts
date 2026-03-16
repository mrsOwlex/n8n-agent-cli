type JsonObject = Record<string, unknown>;

interface WorkflowNode {
  name: string;
  type: string;
  parameters?: JsonObject;
}

interface Connection {
  node: string;
  type: string;
  index: number;
}

export interface DiffResult {
  nodesAdded: Array<{ name: string; type: string }>;
  nodesRemoved: Array<{ name: string; type: string }>;
  nodesChanged: Array<{ name: string; changes: string[] }>;
  connectionsAdded: string[];
  connectionsRemoved: string[];
  settingsChanged: string[];
}

export function diffWorkflows(source: JsonObject, target: JsonObject): DiffResult {
  const result: DiffResult = {
    nodesAdded: [],
    nodesRemoved: [],
    nodesChanged: [],
    connectionsAdded: [],
    connectionsRemoved: [],
    settingsChanged: [],
  };

  // Diff nodes
  const sourceNodes = new Map<string, WorkflowNode>();
  const targetNodes = new Map<string, WorkflowNode>();

  for (const n of (source.nodes ?? []) as WorkflowNode[]) {
    sourceNodes.set(n.name, n);
  }
  for (const n of (target.nodes ?? []) as WorkflowNode[]) {
    targetNodes.set(n.name, n);
  }

  for (const [name, node] of targetNodes) {
    if (!sourceNodes.has(name)) {
      result.nodesAdded.push({ name, type: node.type });
    }
  }

  for (const [name, node] of sourceNodes) {
    if (!targetNodes.has(name)) {
      result.nodesRemoved.push({ name, type: node.type });
    }
  }

  for (const [name, targetNode] of targetNodes) {
    const sourceNode = sourceNodes.get(name);
    if (!sourceNode) continue;

    const changes: string[] = [];

    if (sourceNode.type !== targetNode.type) {
      changes.push(`type: ${sourceNode.type} → ${targetNode.type}`);
    }

    const sourceParams = JSON.stringify(sourceNode.parameters ?? {});
    const targetParams = JSON.stringify(targetNode.parameters ?? {});
    if (sourceParams !== targetParams) {
      changes.push("parameters changed");
    }

    if (changes.length > 0) {
      result.nodesChanged.push({ name, changes });
    }
  }

  // Diff connections
  const sourceConns = flattenConnections(source.connections as Record<string, Record<string, Connection[][]>> ?? {});
  const targetConns = flattenConnections(target.connections as Record<string, Record<string, Connection[][]>> ?? {});

  for (const conn of targetConns) {
    if (!sourceConns.includes(conn)) {
      result.connectionsAdded.push(conn);
    }
  }

  for (const conn of sourceConns) {
    if (!targetConns.includes(conn)) {
      result.connectionsRemoved.push(conn);
    }
  }

  // Diff settings
  const sourceSettings = JSON.stringify(source.settings ?? {});
  const targetSettings = JSON.stringify(target.settings ?? {});
  if (sourceSettings !== targetSettings) {
    result.settingsChanged.push("settings changed");
  }

  return result;
}

function flattenConnections(connections: Record<string, Record<string, Connection[][]>>): string[] {
  const flat: string[] = [];

  for (const [sourceName, outputs] of Object.entries(connections)) {
    for (const [outputType, branches] of Object.entries(outputs)) {
      for (let i = 0; i < branches.length; i++) {
        const targets = branches[i];
        if (!targets) continue;
        for (const target of targets) {
          flat.push(`${sourceName} → ${target.node} [${outputType}:${i}→${target.index}]`);
        }
      }
    }
  }

  return flat.sort();
}

export function formatDiff(diff: DiffResult): string {
  const lines: string[] = [];

  for (const n of diff.nodesAdded) {
    lines.push(`[+] Node added: "${n.name}" (${n.type})`);
  }

  for (const n of diff.nodesRemoved) {
    lines.push(`[-] Node removed: "${n.name}" (${n.type})`);
  }

  for (const n of diff.nodesChanged) {
    lines.push(`[~] Node changed: "${n.name}" — ${n.changes.join(", ")}`);
  }

  for (const c of diff.connectionsAdded) {
    lines.push(`[+] Connection added: ${c}`);
  }

  for (const c of diff.connectionsRemoved) {
    lines.push(`[-] Connection removed: ${c}`);
  }

  for (const s of diff.settingsChanged) {
    lines.push(`[~] ${s}`);
  }

  if (lines.length === 0) {
    lines.push("No differences found.");
  }

  return lines.join("\n");
}
