import { getAllKnownTypes } from "./node-map.js";

type JsonObject = Record<string, unknown>;

export interface ValidationIssue {
  rule: string;
  severity: "error" | "warning";
  message: string;
  path?: string;
}

interface WorkflowNode {
  name: string;
  type: string;
  parameters?: JsonObject;
}

type Connection = { node: string; type: string; index: number };

const ALL_RULES = [
  "required-fields",
  "no-unknown-nodes",
  "no-broken-connections",
  "no-hardcoded-secrets",
] as const;

type RuleName = (typeof ALL_RULES)[number];

const SECRET_PATTERNS = [
  /(?:api[_-]?key|apikey)\s*[:=]\s*["']?[a-zA-Z0-9_\-]{20,}/i,
  /(?:secret|password|token)\s*[:=]\s*["']?[a-zA-Z0-9_\-]{16,}/i,
  /sk-[a-zA-Z0-9]{20,}/,
  /Bearer\s+[a-zA-Z0-9_\-\.]{20,}/,
];

export function validateWorkflow(workflow: JsonObject, rules?: string[]): ValidationIssue[] {
  const activeRules = new Set<RuleName>(
    rules
      ? rules.filter((r): r is RuleName => ALL_RULES.includes(r as RuleName))
      : [...ALL_RULES]
  );

  const issues: ValidationIssue[] = [];

  if (activeRules.has("required-fields")) {
    checkRequiredFields(workflow, issues);
  }

  if (activeRules.has("no-unknown-nodes")) {
    checkUnknownNodes(workflow, issues);
  }

  if (activeRules.has("no-broken-connections")) {
    checkBrokenConnections(workflow, issues);
  }

  if (activeRules.has("no-hardcoded-secrets")) {
    checkHardcodedSecrets(workflow, issues);
  }

  return issues;
}

function checkRequiredFields(workflow: JsonObject, issues: ValidationIssue[]): void {
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    issues.push({ rule: "required-fields", severity: "error", message: "Missing or invalid 'nodes' array" });
  }

  if (!workflow.connections || typeof workflow.connections !== "object") {
    issues.push({ rule: "required-fields", severity: "error", message: "Missing or invalid 'connections' object" });
  }
}

function checkUnknownNodes(workflow: JsonObject, issues: ValidationIssue[]): void {
  const nodes = workflow.nodes as WorkflowNode[] | undefined;
  if (!Array.isArray(nodes)) return;

  const known = new Set(getAllKnownTypes());

  for (const node of nodes) {
    if (!known.has(node.type)) {
      issues.push({
        rule: "no-unknown-nodes",
        severity: "warning",
        message: `Unknown node type: ${node.type}`,
        path: `nodes[${JSON.stringify(node.name)}]`,
      });
    }
  }
}

function checkBrokenConnections(workflow: JsonObject, issues: ValidationIssue[]): void {
  const nodes = workflow.nodes as WorkflowNode[] | undefined;
  if (!Array.isArray(nodes)) return;

  const nodeNames = new Set(nodes.map((n) => n.name));
  const connections = workflow.connections as Record<string, Record<string, Connection[][]>> | undefined;
  if (!connections) return;

  for (const [sourceName, outputs] of Object.entries(connections)) {
    if (!nodeNames.has(sourceName)) {
      issues.push({
        rule: "no-broken-connections",
        severity: "error",
        message: `Connection source "${sourceName}" does not exist as a node`,
      });
    }

    for (const branches of Object.values(outputs)) {
      for (const branch of branches) {
        if (!Array.isArray(branch)) continue;
        for (const target of branch) {
          if (!nodeNames.has(target.node)) {
            issues.push({
              rule: "no-broken-connections",
              severity: "error",
              message: `Connection target "${target.node}" (from "${sourceName}") does not exist as a node`,
            });
          }
        }
      }
    }
  }
}

function checkHardcodedSecrets(workflow: JsonObject, issues: ValidationIssue[]): void {
  const nodes = workflow.nodes as WorkflowNode[] | undefined;
  if (!Array.isArray(nodes)) return;

  for (const node of nodes) {
    if (!node.parameters) continue;
    scanForSecrets(node.parameters, `nodes[${JSON.stringify(node.name)}].parameters`, issues);
  }
}

function scanForSecrets(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (typeof value === "string") {
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(value)) {
        issues.push({
          rule: "no-hardcoded-secrets",
          severity: "warning",
          message: `Possible hardcoded secret at ${path}`,
          path,
        });
        return;
      }
    }
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      scanForSecrets(value[i], `${path}[${i}]`, issues);
    }
  } else if (typeof value === "object" && value !== null) {
    for (const [k, v] of Object.entries(value as JsonObject)) {
      scanForSecrets(v, `${path}.${k}`, issues);
    }
  }
}
