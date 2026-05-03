import { NodeSchema } from '../types/n8n';

export const NODE_SCHEMAS: NodeSchema[] = [
  {
    type: 'n8n-nodes-base.scheduleTrigger',
    displayName: 'Schedule Trigger',
    description: 'Triggers the workflow at a specified time or interval.',
    parameters: [
      {
        name: 'rule',
        displayName: 'Rule',
        type: 'options',
        required: true,
        default: 'triggerAtSpecificTime',
        description: 'The rule that determines when the workflow should trigger.',
        options: [
          { name: 'At a specific time', value: 'triggerAtSpecificTime' },
          { name: 'Every day', value: 'everyDay' },
          { name: 'Every hour', value: 'everyHour' },
          { name: 'Every minute', value: 'everyMinute' },
          { name: 'Custom (Cron)', value: 'cron' }
        ]
      },
      {
        name: 'value',
        displayName: 'Value',
        type: 'string',
        required: false,
        default: '',
        description: 'The value for the trigger (e.g. time string or cron expression).'
      }
    ]
  },
  {
    type: 'n8n-nodes-base.webhook',
    displayName: 'Webhook',
    description: 'Receives data via an HTTP request.',
    parameters: [
      {
        name: 'path',
        displayName: 'Path',
        type: 'string',
        required: true,
        default: '',
        description: 'The path of the webhook.'
      },
      {
        name: 'httpMethod',
        displayName: 'HTTP Method',
        type: 'options',
        required: true,
        default: 'GET',
        description: 'The HTTP method to use.',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'DELETE', value: 'DELETE' }
        ]
      },
      {
        name: 'responseMode',
        displayName: 'Response Mode',
        type: 'options',
        required: false,
        default: 'onReceived',
        description: 'When to send the response.',
        options: [
          { name: 'When received', value: 'onReceived' },
          { name: 'Last node finished', value: 'lastNode' }
        ]
      }
    ]
  },
  {
    type: 'n8n-nodes-base.httpRequest',
    displayName: 'HTTP Request',
    description: 'Makes an HTTP request and returns the data.',
    parameters: [
      {
        name: 'method',
        displayName: 'Method',
        type: 'options',
        required: true,
        default: 'GET',
        description: 'The HTTP method to use.',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'DELETE', value: 'DELETE' }
        ]
      },
      {
        name: 'url',
        displayName: 'URL',
        type: 'string',
        required: true,
        default: '',
        description: 'The URL to make the request to.'
      },
      {
        name: 'sendBody',
        displayName: 'Send Body',
        type: 'boolean',
        required: false,
        default: false,
        description: 'Whether to send a request body.'
      }
    ]
  },
  {
    type: 'n8n-nodes-base.gmail',
    displayName: 'Gmail',
    description: 'Sends and receives emails via Gmail.',
    parameters: [
      {
        name: 'resource',
        displayName: 'Resource',
        type: 'options',
        required: true,
        default: 'message',
        description: 'The resource to operate on.',
        options: [
          { name: 'Message', value: 'message' },
          { name: 'Draft', value: 'draft' },
          { name: 'Label', value: 'label' }
        ]
      },
      {
        name: 'operation',
        displayName: 'Operation',
        type: 'options',
        required: true,
        default: 'send',
        description: 'The operation to perform.',
        options: [
          { name: 'Send', value: 'send' },
          { name: 'Get', value: 'get' },
          { name: 'List', value: 'getAll' }
        ]
      }
    ]
  },
  {
    type: 'n8n-nodes-base.slack',
    displayName: 'Slack',
    description: 'Sends messages to Slack channels.',
    parameters: [
      {
        name: 'resource',
        displayName: 'Resource',
        type: 'options',
        required: true,
        default: 'chat',
        description: 'The resource to operate on.',
        options: [
          { name: 'Chat', value: 'chat' },
          { name: 'Channel', value: 'channel' },
          { name: 'File', value: 'file' }
        ]
      },
      {
        name: 'operation',
        displayName: 'Operation',
        type: 'options',
        required: true,
        default: 'postMessage',
        description: 'The operation to perform.',
        options: [
          { name: 'Post Message', value: 'postMessage' },
          { name: 'Update Message', value: 'update' }
        ]
      },
      {
        name: 'channel',
        displayName: 'Channel',
        type: 'string',
        required: true,
        default: '',
        description: 'The Slack channel to send the message to.'
      }
    ]
  },
  {
    type: 'n8n-nodes-base.googleSheets',
    displayName: 'Google Sheets',
    description: 'Reads and writes data to Google Sheets.',
    parameters: [
      {
        name: 'resource',
        displayName: 'Resource',
        type: 'options',
        required: true,
        default: 'sheet',
        description: 'The resource to operate on.',
        options: [
          { name: 'Sheet', value: 'sheet' },
          { name: 'Spreadsheet', value: 'spreadsheet' }
        ]
      },
      {
        name: 'operation',
        displayName: 'Operation',
        type: 'options',
        required: true,
        default: 'append',
        description: 'The operation to perform.',
        options: [
          { name: 'Append', value: 'append' },
          { name: 'Read', value: 'read' },
          { name: 'Update', value: 'update' }
        ]
      },
      {
        name: 'spreadsheetId',
        displayName: 'Spreadsheet ID',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the spreadsheet.'
      }
    ]
  },
  {
    type: 'n8n-nodes-base.openAi',
    displayName: 'OpenAI',
    description: 'Generates text and images using OpenAI.',
    parameters: [
      {
        name: 'resource',
        displayName: 'Resource',
        type: 'options',
        required: true,
        default: 'chat',
        description: 'The resource to operate on.',
        options: [
          { name: 'Chat', value: 'chat' },
          { name: 'Image', value: 'image' }
        ]
      },
      {
        name: 'operation',
        displayName: 'Operation',
        type: 'options',
        required: true,
        default: 'completions',
        description: 'The operation to perform.',
        options: [
          { name: 'Completions', value: 'completions' }
        ]
      },
      {
        name: 'model',
        displayName: 'Model',
        type: 'string',
        required: true,
        default: 'gpt-4o',
        description: 'The model to use.'
      }
    ]
  },
  {
    type: 'n8n-nodes-base.if',
    displayName: 'IF / Conditional',
    description: 'Branches the workflow based on conditions.',
    parameters: [
      {
        name: 'conditions',
        displayName: 'Conditions',
        type: 'boolean',
        required: true,
        default: true,
        description: 'The conditions to evaluate.'
      }
    ]
  },
  {
    type: 'n8n-nodes-base.set',
    displayName: 'Set / Data Transform',
    description: 'Sets or transforms data in the workflow.',
    parameters: [
      {
        name: 'values',
        displayName: 'Values',
        type: 'fixedCollection',
        required: true,
        default: {},
        description: 'The values to set.'
      }
    ]
  },
  {
    type: 'n8n-nodes-base.code',
    displayName: 'Code',
    description: 'Executes custom JavaScript or Python code.',
    parameters: [
      {
        name: 'language',
        displayName: 'Language',
        type: 'options',
        required: true,
        default: 'javascript',
        description: 'The programming language to use.',
        options: [
          { name: 'JavaScript', value: 'javascript' },
          { name: 'Python', value: 'python' }
        ]
      },
      {
        name: 'jsCode',
        displayName: 'JavaScript Code',
        type: 'string',
        required: false,
        default: '// Add your code here\nreturn item;',
        description: 'The JavaScript code to execute.'
      }
    ]
  }
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getNodeSchema(type: string): NodeSchema | undefined {
  return NODE_SCHEMAS.find(s => s.type === type);
}

export function getSchemaSummaryForAI(): string {
  return NODE_SCHEMAS.map(schema =>
    `## ${schema.displayName} (type: "${schema.type}")\n${schema.description}\nKey parameters: ${schema.parameters.map(p => `${p.name} (${p.type}${p.required ? ', required' : ''})`).join(', ')}`
  ).join('\n\n---\n\n');
}
