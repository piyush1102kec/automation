import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'ollama',
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
});

const MODEL = 'qwen2.5-coder:32b';

/**
 * System prompt designed to instruct the AI on generating valid n8n workflow JSON.
 */
const N8N_SYSTEM_PROMPT = `You are an expert n8n workflow engineer. Your task is to generate a valid n8n workflow JSON based on a user's natural language description.

### CRITICAL SCHEMA RULES:
1.  **Root Structure**: The output MUST be a JSON object with these top-level keys:
    - "name": String (workflow name)
    - "nodes": Array of node objects
    - "connections": Object mapping source nodes to their connections
    - "meta": Object (metadata)
    - "active": Boolean (default: false)
    - "settings": Object (default: {})

2.  **Node Object**: Each node in the "nodes" array MUST have:
    - "parameters": Object (configuration for the node)
    - "id": String (UUID format)
    - "name": String (Unique name, used in connections)
    - "type": String (e.g., "n8n-nodes-base.webhook", "n8n-nodes-base.httpRequest")
    - "typeVersion": Number (use 1 or 2 as default if unknown)
    - "position": [Number, Number] (e.g., [400, 200])

3.  **Connections Object**:
    - Keys are the NAME of the source node.
    - Value is an object: { "main": [ [ { "node": "TargetNodeName", "type": "main", "index": 0 } ] ] }
    - This is a nested array. The outer array represents output ports, the inner array represents multiple connections from that port.

### COMMON NODE TYPES:
- Webhook: "n8n-nodes-base.webhook" (parameters: { path, options: {} })
- HTTP Request: "n8n-nodes-base.httpRequest" (parameters: { url, method, authentication: "none", ... })
- Set: "n8n-nodes-base.set" (parameters: { values: { string: [ { name, value } ] } })
- Slack: "n8n-nodes-base.slack" (parameters: { resource, operation, channel, text })

### OUTPUT FORMAT:
Return ONLY the raw JSON object. No preamble, no markdown formatting (like \`\`\`json), and no closing explanation. Ensure the JSON is valid and can be parsed immediately.`;

export async function generateN8nWorkflow(prompt: string): Promise<any> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [
      { role: 'system', content: N8N_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate an n8n workflow for: ${prompt}`,
      },
    ],
  });

  const content = response.choices[0].message.content ?? '';
  
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse AI-generated JSON:', content);
    throw new Error('AI generated invalid JSON. Check logs for details.');
  }
}
