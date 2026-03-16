// Mapping from n8n node types to human-readable factory names for codegen
const NODE_TYPE_MAP: Record<string, string> = {
  "n8n-nodes-base.webhook": "webhook",
  "n8n-nodes-base.httpRequest": "httpRequest",
  "n8n-nodes-base.set": "set",
  "n8n-nodes-base.code": "code",
  "n8n-nodes-base.if": "ifNode",
  "n8n-nodes-base.switch": "switchNode",
  "n8n-nodes-base.merge": "merge",
  "n8n-nodes-base.noOp": "noOp",
  "n8n-nodes-base.respondToWebhook": "respondToWebhook",
  "n8n-nodes-base.function": "functionNode",
  "n8n-nodes-base.functionItem": "functionItem",
  "n8n-nodes-base.executeWorkflowTrigger": "executeWorkflowTrigger",
  "n8n-nodes-base.manualTrigger": "manualTrigger",
  "n8n-nodes-base.scheduleTrigger": "scheduleTrigger",
  "n8n-nodes-base.splitInBatches": "splitInBatches",
  "n8n-nodes-base.wait": "wait",
  "@n8n/n8n-nodes-langchain.agent": "agent",
  "@n8n/n8n-nodes-langchain.chainLlm": "chainLlm",
  "@n8n/n8n-nodes-langchain.lmChatOpenAi": "lmChatOpenAi",
};

export function getFactoryName(nodeType: string): string | undefined {
  return NODE_TYPE_MAP[nodeType];
}

export function isKnownNodeType(nodeType: string): boolean {
  return nodeType in NODE_TYPE_MAP;
}

export function getAllKnownTypes(): string[] {
  return Object.keys(NODE_TYPE_MAP);
}
