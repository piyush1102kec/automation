export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, { id: string; name: string }>;
}

export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

export type N8nConnections = Record<string, {
  main: N8nConnection[][];
}>;

export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: N8nConnections;
  active: boolean;
  settings: Record<string, any>;
}

export interface N8nCredential {
  id: string;
  name: string;
  type: string;
}

export interface N8nExecution {
  id: string;
  status: 'success' | 'failed' | 'running' | 'waiting';
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  data?: Record<string, any>;
}

export interface N8nApiResponse<T> {
  data: T;
  nextCursor?: string;
}

export interface N8nApiError {
  code: string;
  message: string;
  hint?: string;
}

export interface NodeParameterOption {
  name: string;
  value: string | number | boolean;
}

export interface NodeParameter {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'fixedCollection' | 'dateTime' | 'collection';
  required: boolean;
  default: any;
  description: string;
  options?: NodeParameterOption[];
}

export interface NodeSchema {
  type: string;
  displayName: string;
  description: string;
  parameters: NodeParameter[];
}

// ── POC-specific types ────────────────────────────────────────────────────────

export interface ConnectionConfig {
  baseUrl: string;
  apiKey: string;
}

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
