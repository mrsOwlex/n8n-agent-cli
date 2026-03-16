export class N8nApiError extends Error {
  readonly statusCode: number;
  readonly statusText: string;
  readonly body: string;

  constructor(statusCode: number, statusText: string, body: string, method: string, path: string) {
    super(`n8n API error (${statusCode} ${statusText}) for ${method} ${path}: ${body}`);
    this.name = "N8nApiError";
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.body = body;
  }
}

export class UnauthorizedError extends N8nApiError {
  constructor(body: string, method: string, path: string) {
    super(401, "Unauthorized", body, method, path);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends N8nApiError {
  constructor(body: string, method: string, path: string) {
    super(403, "Forbidden", body, method, path);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends N8nApiError {
  constructor(body: string, method: string, path: string) {
    super(404, "Not Found", body, method, path);
    this.name = "NotFoundError";
  }
}

export class ServerError extends N8nApiError {
  constructor(statusCode: number, statusText: string, body: string, method: string, path: string) {
    super(statusCode, statusText, body, method, path);
    this.name = "ServerError";
  }
}

export function createApiError(statusCode: number, statusText: string, body: string, method: string, path: string): N8nApiError {
  switch (statusCode) {
    case 401:
      return new UnauthorizedError(body, method, path);
    case 403:
      return new ForbiddenError(body, method, path);
    case 404:
      return new NotFoundError(body, method, path);
    default:
      if (statusCode >= 500) {
        return new ServerError(statusCode, statusText, body, method, path);
      }
      return new N8nApiError(statusCode, statusText, body, method, path);
  }
}
