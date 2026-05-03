// ─────────────────────────────────────────────────────────────────────────────
//  Schema library for the 10 core n8n node types
//  Used to build the AI system prompt so the model knows valid node types
//  and required parameters.
// ─────────────────────────────────────────────────────────────────────────────

interface NodeParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface NodeSchema {
  type: string;          // e.g. "n8n-nodes-base.scheduleTrigger"
  displayName: string;
  description: string;
  parameters: NodeParameter[];
}

export const NODE_SCHEMAS: NodeSchema[] = [
  {
    type: 'n8n-nodes-base.scheduleTrigger',
    displayName: 'Schedule Trigger',
    description: 'Triggers the workflow on a time-based schedule (cron or interval).',
    parameters: [
      { name: 'rule', type: 'object', required: true, description: 'Schedule rule with interval array' },
    ],
  },
  {
    type: 'n8n-nodes-base.webhook',
    displayName: 'Webhook',
    description: 'Triggers the workflow when an HTTP request is received at a unique URL.',
    parameters: [
      { name: 'httpMethod', type: 'string', required: true, description: 'GET, POST, PUT, DELETE' },
      { name: 'path', type: 'string', required: true, description: 'URL path segment' },
      { name: 'responseMode', type: 'string', required: false },
    ],
  },
  {
    type: 'n8n-nodes-base.httpRequest',
    displayName: 'HTTP Request',
    description: 'Makes HTTP requests to any external API or URL.',
    parameters: [
      { name: 'method', type: 'string', required: true, description: 'GET, POST, PUT, DELETE, PATCH' },
      { name: 'url', type: 'string', required: true, description: 'Full URL including https://' },
      { name: 'sendBody', type: 'boolean', required: false },
      { name: 'bodyParameters', type: 'object', required: false },
      { name: 'headerParameters', type: 'object', required: false },
    ],
  },
  {
    type: 'n8n-nodes-base.gmail',
    displayName: 'Gmail',
    description: 'Send and read emails via Gmail.',
    parameters: [
      { name: 'resource', type: 'string', required: true, description: '"message" or "draft"' },
      { name: 'operation', type: 'string', required: true, description: '"send", "get", "getAll", "delete"' },
      { name: 'to', type: 'string', required: false, description: 'Recipient email address (for send)' },
      { name: 'subject', type: 'string', required: false, description: 'Email subject (for send)' },
      { name: 'message', type: 'string', required: false, description: 'Email body text (for send)' },
    ],
  },
  {
    type: 'n8n-nodes-base.slack',
    displayName: 'Slack',
    description: 'Send messages and interact with Slack channels.',
    parameters: [
      { name: 'resource', type: 'string', required: true, description: '"message", "channel", "user"' },
      { name: 'operation', type: 'string', required: true, description: '"post", "update", "delete"' },
      { name: 'channel', type: 'string', required: true, description: 'Channel ID or name' },
      { name: 'text', type: 'string', required: false, description: 'Message text' },
    ],
  },
  {
    type: 'n8n-nodes-base.googleSheets',
    displayName: 'Google Sheets',
    description: 'Read and write data in Google Sheets spreadsheets.',
    parameters: [
      { name: 'operation', type: 'string', required: true, description: '"read", "append", "update", "delete"' },
      { name: 'documentId', type: 'string', required: true, description: 'Google Sheets document ID' },
      { name: 'sheetName', type: 'string', required: true, description: 'Sheet tab name' },
    ],
  },
  {
    type: 'n8n-nodes-base.openAi',
    displayName: 'OpenAI',
    description: 'Use OpenAI models for text generation, summarization, and more.',
    parameters: [
      { name: 'resource', type: 'string', required: true, description: '"text", "image", "audio"' },
      { name: 'operation', type: 'string', required: true, description: '"complete", "edit", "moderate"' },
      { name: 'model', type: 'string', required: false, description: 'e.g. "gpt-4o"' },
      { name: 'prompt', type: 'string', required: false },
    ],
  },
  {
    type: 'n8n-nodes-base.if',
    displayName: 'IF',
    description: 'Routes data down different branches based on a condition.',
    parameters: [
      { name: 'conditions', type: 'object', required: true, description: 'Condition rules' },
    ],
  },
  {
    type: 'n8n-nodes-base.set',
    displayName: 'Set',
    description: 'Sets, adds, or removes fields on the data items.',
    parameters: [
      { name: 'assignments', type: 'object', required: true, description: 'Field assignments array' },
    ],
  },
  {
    type: 'n8n-nodes-base.code',
    displayName: 'Code',
    description: 'Executes custom JavaScript or Python code.',
    parameters: [
      { name: 'language', type: 'string', required: false, description: '"javaScript" or "python"' },
      { name: 'jsCode', type: 'string', required: false, description: 'JavaScript code to run' },
    ],
  },
];

export function getSchemaSummaryForAI(): string {
  return NODE_SCHEMAS.map(schema =>
    `## ${schema.displayName} (type: "${schema.type}", typeVersion: 1)\n${schema.description}\nParameters: ${schema.parameters.map(p => `${p.name} (${p.type}${p.required ? ', required' : ''})`).join(', ')}`
  ).join('\n\n---\n\n');
}
