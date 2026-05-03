// ─────────────────────────────────────────────────────────────────────────────
//  TypeScript types for n8n REST API + workflow generation
// ─────────────────────────────────────────────────────────────────────────────

export interface ConnectionConfig {
  baseUrl: string;
  apiKey: string;
}

// ── n8n Workflow ──────────────────────────────────────────────────────────────

export interface N8nNode {
  id?: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, { id: string; name: string }>;
}

export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, {
    main?: Array<Array<{ node: string; type: string; index: number }>>;
  }>;
  active?: boolean;
  settings?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  tags?: Array<{ id: string; name: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface N8nApiResponse<T> {
  data: T;
  nextCursor?: string;
}

// ── Credentials ───────────────────────────────────────────────────────────────

export interface N8nCredential {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

// ── Executions ────────────────────────────────────────────────────────────────

export interface N8nExecution {
  id: string;
  workflowId: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  status: 'success' | 'error' | 'waiting' | 'running';
}

// ── Generation ────────────────────────────────────────────────────────────────

export interface WorkflowStep {
  nodeType: string;
  nodeName: string;
  description: string;
}

export interface GeneratedWorkflow {
  workflow: N8nWorkflow;
  explanation: string;
  steps: WorkflowStep[];
}

export interface PushResult {
  workflowId: string;
  workflowUrl: string;
  activated: boolean;
}
