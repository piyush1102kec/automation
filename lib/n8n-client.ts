// ─────────────────────────────────────────────────────────────────────────────
//  n8n REST API client — supports self-hosted and n8n Cloud
// ─────────────────────────────────────────────────────────────────────────────

import type {
  N8nWorkflow,
  N8nCredential,
  N8nExecution,
  N8nApiResponse,
  ConnectionConfig,
  PushResult,
} from '@/types/n8n';

export class N8nApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public hint?: string,
  ) {
    super(message);
    this.name = 'N8nApiError';
  }
}

export class N8nClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/v1${path}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.apiKey,
        ...options.headers,
      },
    });

    if (!res.ok) {
      let hint: string | undefined;
      let rawBody = '';
      try {
        rawBody = await res.text();
        const body = JSON.parse(rawBody) as { message?: string; hint?: string };
        hint = body.hint ?? body.message;
      } catch { hint = rawBody.slice(0, 300); }

      if (res.status === 401) throw new N8nApiError('Invalid API key — check your n8n API key.', 401, hint);
      if (res.status === 403) throw new N8nApiError('Forbidden — ensure API access is enabled in n8n settings.', 403, hint);
      if (res.status === 404) throw new N8nApiError(`Not found: ${path}`, 404, hint);
      throw new N8nApiError(`n8n API error ${res.status}: ${hint ?? rawBody.slice(0, 200)}`, res.status, hint);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  async testConnection(): Promise<{ connected: boolean; workflowCount: number }> {
    const data = await this.request<N8nApiResponse<N8nWorkflow[]>>('/workflows?limit=1');
    return { connected: true, workflowCount: data.data?.length ?? 0 };
  }

  async listWorkflows(): Promise<N8nWorkflow[]> {
    const data = await this.request<N8nApiResponse<N8nWorkflow[]>>('/workflows');
    return data.data ?? [];
  }

  async createWorkflow(workflow: N8nWorkflow): Promise<N8nWorkflow> {
    // n8n API rejects active, id, and meta as read-only fields on create
    const { active: _a, id: _i, meta: _m, ...body } = workflow as N8nWorkflow & { active?: boolean; meta?: unknown };
    return this.request<N8nWorkflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async activateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(`/workflows/${id}/activate`, { method: 'POST' });
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.request<void>(`/workflows/${id}`, { method: 'DELETE' });
  }

  async pushWorkflow(workflow: N8nWorkflow, activate = false): Promise<PushResult> {
    const created = await this.createWorkflow(workflow);
    const id = created.id!;

    if (activate) {
      await this.activateWorkflow(id);
    }

    return {
      workflowId: id,
      workflowUrl: `${this.baseUrl}/workflow/${id}`,
      activated: activate,
    };
  }

  async listExecutions(workflowId?: string, limit = 20): Promise<N8nExecution[]> {
    const query = workflowId ? `?workflowId=${workflowId}&limit=${limit}` : `?limit=${limit}`;
    const data = await this.request<N8nApiResponse<N8nExecution[]>>(`/executions${query}`);
    return data.data ?? [];
  }

  async listCredentials(): Promise<N8nCredential[]> {
    const data = await this.request<N8nApiResponse<N8nCredential[]>>('/credentials');
    return data.data ?? [];
  }
}

export function createN8nClient(config?: Partial<ConnectionConfig>): N8nClient {
  const baseUrl = config?.baseUrl ?? process.env.N8N_BASE_URL ?? '';
  const apiKey  = config?.apiKey  ?? process.env.N8N_API_KEY  ?? '';
  if (!baseUrl) throw new N8nApiError('N8N_BASE_URL is not set.');
  if (!apiKey)  throw new N8nApiError('N8N_API_KEY is not set.');
  return new N8nClient({ baseUrl, apiKey });
}
