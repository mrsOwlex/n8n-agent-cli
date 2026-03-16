import { createApiError, type N8nApiError } from "./errors.js";

export interface N8nClientConfig {
  baseUrl: string;
  apiKey: string;
  verbose?: boolean;
}

type JsonObject = Record<string, unknown>;

interface WorkflowListResponse {
  data: JsonObject[];
  nextCursor?: string | null;
}

interface ExecutionListResponse {
  data: JsonObject[];
  nextCursor?: string | null;
}

export class N8nClient {
  private readonly baseUrl: URL;
  private readonly apiKey: string;
  private readonly verbose: boolean;

  constructor(config: N8nClientConfig) {
    const url = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`;
    this.baseUrl = new URL(url);
    this.apiKey = config.apiKey;
    this.verbose = config.verbose ?? false;
  }

  async ping(): Promise<{ ok: boolean; workflows: number }> {
    const response = await this.request<WorkflowListResponse>("GET", "/workflows?limit=1");
    return { ok: true, workflows: response.data?.length ?? 0 };
  }

  async listWorkflows(): Promise<JsonObject[]> {
    const response = await this.request<WorkflowListResponse>("GET", "/workflows");
    return response.data ?? [];
  }

  async getWorkflow(id: string): Promise<JsonObject> {
    return this.request<JsonObject>("GET", `/workflows/${encodeURIComponent(id)}`);
  }

  async createWorkflow(body: JsonObject): Promise<JsonObject> {
    return this.request<JsonObject>("POST", "/workflows", body);
  }

  async updateWorkflow(id: string, body: JsonObject): Promise<JsonObject> {
    return this.request<JsonObject>("PUT", `/workflows/${encodeURIComponent(id)}`, body);
  }

  async activateWorkflow(id: string): Promise<JsonObject> {
    return this.request<JsonObject>("POST", `/workflows/${encodeURIComponent(id)}/activate`);
  }

  async deactivateWorkflow(id: string): Promise<JsonObject> {
    return this.request<JsonObject>("POST", `/workflows/${encodeURIComponent(id)}/deactivate`);
  }

  async getExecution(id: string): Promise<JsonObject> {
    return this.request<JsonObject>("GET", `/executions/${encodeURIComponent(id)}`);
  }

  async listExecutions(workflowId?: string): Promise<JsonObject[]> {
    const params = new URLSearchParams();
    if (workflowId) {
      params.set("workflowId", workflowId);
    }
    const query = params.size > 0 ? `?${params.toString()}` : "";
    const response = await this.request<ExecutionListResponse>("GET", `/executions${query}`);
    return response.data ?? [];
  }

  async triggerWebhook(path: string, payload?: JsonObject): Promise<JsonObject> {
    const cleanPath = path.replace(/^\/+/, "");
    const url = new URL(`webhook/${cleanPath}`, this.baseUrl);

    const headers: Record<string, string> = { Accept: "application/json" };
    const init: RequestInit = { method: "POST", headers };

    if (payload) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(payload);
    }

    if (this.verbose) {
      console.error(`→ POST ${url.pathname}`);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      const text = await response.text();
      throw createApiError(response.status, response.statusText, text, "POST", url.pathname);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as JsonObject;
    }

    return { status: "ok", statusCode: response.status };
  }

  async triggerWebhookTest(path: string, payload?: JsonObject): Promise<JsonObject> {
    const cleanPath = path.replace(/^\/+/, "");
    const url = new URL(`webhook-test/${cleanPath}`, this.baseUrl);

    const headers: Record<string, string> = { Accept: "application/json" };
    const init: RequestInit = { method: "POST", headers };

    if (payload) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(payload);
    }

    if (this.verbose) {
      console.error(`→ POST ${url.pathname}`);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      const text = await response.text();
      throw createApiError(response.status, response.statusText, text, "POST", url.pathname);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as JsonObject;
    }

    return { status: "ok", statusCode: response.status };
  }

  async runExecution(workflowId: string, payload?: JsonObject): Promise<JsonObject> {
    const body: JsonObject = { workflowId };
    if (payload) {
      body.payload = payload;
    }
    return this.request<JsonObject>("POST", "/executions", body);
  }

  private async request<T>(method: string, path: string, body?: JsonObject): Promise<T> {
    const url = new URL(`api/v1${path}`, this.baseUrl);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-N8N-API-KEY": this.apiKey,
    };

    const init: RequestInit = { method, headers };

    if (body) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    if (this.verbose) {
      console.error(`→ ${method} ${url.pathname}`);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      const text = await response.text();
      throw createApiError(response.status, response.statusText, text, method, url.pathname);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
