// ─────────────────────────────────────────────────────────────────────────────
//  AI workflow generation pipeline — open-source models via Groq or Ollama
//
//  Priority:
//    1. Groq (cloud, free, fast)  — set GROQ_API_KEY
//    2. Ollama (local)            — set OLLAMA_BASE_URL / OLLAMA_MODEL
//
//  Groq model recommendation: llama-3.3-70b-versatile or qwen-qwq-32b
//  Ollama model recommendation: qwen2.5:7b (needs GPU for acceptable speed)
// ─────────────────────────────────────────────────────────────────────────────

import { getSchemaSummaryForAI } from './n8n-node-schemas';
import type { N8nWorkflow, GeneratedWorkflow, WorkflowStep } from '@/types/n8n';
import { randomUUID } from 'crypto';

// ── Provider selection ────────────────────────────────────────────────────────
const GROQ_API_KEY    = process.env.GROQ_API_KEY ?? '';
const GROQ_MODEL      = process.env.GROQ_MODEL   ?? 'llama-3.3-70b-versatile';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    ?? 'qwen2.5:7b';

function useGroq(): boolean { return !!GROQ_API_KEY; }

// ── Chat call (OpenAI-compatible — works for Groq and Ollama) ─────────────────

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function llmChat(messages: OllamaMessage[], timeoutMs = 60_000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const isGroq  = useGroq();
  const baseUrl = isGroq ? 'https://api.groq.com/openai/v1' : `${OLLAMA_BASE_URL}/v1`;
  const model   = isGroq ? GROQ_MODEL : OLLAMA_MODEL;
  const authKey = isGroq ? GROQ_API_KEY : 'ollama';

  const body: Record<string, unknown> = {
    model,
    messages,
    stream: false,
    temperature: 0.1,
    max_tokens: 4096,
  };

  // Ollama-specific: also set num_predict
  if (!isGroq) {
    body.options = { num_predict: 4096 };
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authKey}` },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      const provider = isGroq ? 'Groq' : 'Ollama';
      throw new Error(`${provider} error ${res.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await res.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    return data.choices?.[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timer);
  }
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are an expert n8n workflow engineer. Your job is to generate valid n8n workflow JSON from a user's plain-English description of an automation.

## STRICT OUTPUT FORMAT
Return ONLY a raw JSON object with exactly two top-level keys:
1. "workflow" — the complete n8n workflow object
2. "explanation" — a single sentence describing what the workflow does

Do NOT wrap in markdown. Do NOT use code fences. Do NOT add any text before or after the JSON object.

## WORKFLOW JSON STRUCTURE

Root object:
{
  "name": "<descriptive name>",
  "nodes": [ ...node objects... ],
  "connections": { ...connection map... },
  "active": false,
  "settings": { "executionOrder": "v1" },
  "meta": { "templateCredsSetupCompleted": true }
}

Every node object MUST have ALL these fields:
{
  "id": "<uuid-v4>",
  "name": "<unique human-readable name>",
  "type": "<n8n-nodes-base.typeName>",
  "typeVersion": <number>,
  "position": [<x>, <y>],
  "parameters": { ... }
}

Connections map rules:
- Key = source node NAME (string, not id)
- Value = { "main": [[{ "node": "<target name>", "type": "main", "index": 0 }]] }

Node positioning:
- First node: [200, 300]
- Each following node: add 220 to x

## AVAILABLE NODES
${getSchemaSummaryForAI()}

## GENERATION RULES
- Always start with a trigger node (scheduleTrigger or webhook)
- Only use node types from the AVAILABLE NODES list above
- Generate real UUID v4 strings for every node id
- Fill all required parameters — never leave required fields empty
- For dynamic values use n8n expression syntax: ={{ $json.fieldName }}
- email mentioned → Gmail node
- Slack/notify/alert → Slack node
- AI summarize/generate → OpenAI node
- save data/spreadsheet → Google Sheets node
- fetch URL/API call → HTTP Request node`;
}

// ── Strip <think> blocks (Qwen3 reasoning tokens) ────────────────────────────

function stripThinkingTokens(raw: string): string {
  return raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

// ── Extract JSON from model output ────────────────────────────────────────────

function extractJson(raw: string): string {
  const clean = stripThinkingTokens(raw);

  // Strip markdown code fences
  const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Extract outermost { ... }
  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');
  if (start !== -1 && end > start) return clean.slice(start, end + 1);

  return clean.trim();
}

// ── Ensure every node has a proper UUID ──────────────────────────────────────

function normaliseWorkflow(workflow: N8nWorkflow): N8nWorkflow {
  return {
    ...workflow,
    nodes: workflow.nodes.map(node => ({
      ...node,
      id: node.id && node.id.length > 10 ? node.id : randomUUID(),
    })),
  };
}

// ── Derive human-readable steps ───────────────────────────────────────────────

function deriveSteps(workflow: N8nWorkflow): WorkflowStep[] {
  return workflow.nodes.map(node => {
    const baseType = node.type.replace('n8n-nodes-base.', '');
    const p = node.parameters as Record<string, unknown>;

    const describe: Record<string, () => string> = {
      scheduleTrigger: () => {
        const interval = (p.rule as { interval?: Array<{ field?: string; triggerAtHour?: number }> })?.interval?.[0];
        if (interval?.field === 'weeks')  return `Runs weekly at ${interval.triggerAtHour ?? 9}:00`;
        if (interval?.field === 'days')   return 'Runs daily';
        if (interval?.field === 'hours')  return 'Runs every hour';
        if (interval?.field === 'minutes') return 'Runs every few minutes';
        return 'Runs on a schedule';
      },
      webhook:      () => `Triggered by ${p.httpMethod ?? 'POST'} request at /${p.path ?? 'webhook'}`,
      httpRequest:  () => `Fetches data from ${p.url ?? 'external URL'}`,
      gmail:        () => p.operation === 'send' ? `Sends email to ${p.toList ?? 'recipient'}` : 'Reads Gmail messages',
      slack:        () => `Posts to Slack channel ${p.channel ?? ''}`,
      googleSheets: () => p.operation === 'read' ? 'Reads rows from Google Sheets' : 'Saves data to Google Sheets',
      openAi:       () => `Processes with AI model (${p.modelId ?? p.model ?? 'default'})`,
      if:           () => 'Routes items based on a condition',
      set:          () => 'Transforms / reshapes data fields',
      code:         () => 'Runs custom code',
    };

    return {
      nodeType:    node.type,
      nodeName:    node.name,
      description: describe[baseType]?.() ?? `Executes ${node.name}`,
    };
  });
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateWorkflow(prompt: string): Promise<GeneratedWorkflow> {
  const systemPrompt = buildSystemPrompt();

  const attempt = async (correctionHint?: string): Promise<GeneratedWorkflow> => {
    const userContent = correctionHint
      ? `${correctionHint}\n\nOriginal request: ${prompt}`
      : `Generate an n8n workflow for: ${prompt}`;

    const raw = await llmChat([
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userContent },
    ]);

    const jsonStr = extractJson(raw);

    let parsed: { workflow: N8nWorkflow; explanation: string };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error(
        `Model returned invalid JSON. Raw output snippet: ${raw.slice(0, 400)}`
      );
    }

    if (!Array.isArray(parsed.workflow?.nodes)) {
      throw new Error('Generated workflow is missing the nodes array.');
    }
    if (typeof parsed.workflow?.connections !== 'object') {
      throw new Error('Generated workflow is missing the connections object.');
    }

    const workflow = normaliseWorkflow(parsed.workflow);
    return {
      workflow,
      explanation: parsed.explanation ?? 'Workflow generated.',
      steps: deriveSteps(workflow),
    };
  };

  try {
    return await attempt();
  } catch (firstErr) {
    // One retry with explicit JSON-only instruction
    try {
      return await attempt(
        'CORRECTION: Return ONLY a raw JSON object — no markdown, no code fences, no explanation text outside the JSON. The object must have keys "workflow" and "explanation".'
      );
    } catch {
      throw firstErr;
    }
  }
}

// ── Health check helper ───────────────────────────────────────────────────────

export async function checkOllamaHealth(): Promise<{ ok: boolean; model: string; error?: string }> {
  // Groq path — just verify the API key works
  if (useGroq()) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Groq API error ${res.status}`);
      return { ok: true, model: `Groq · ${GROQ_MODEL}` };
    } catch (err) {
      return { ok: false, model: GROQ_MODEL, error: err instanceof Error ? err.message : 'Groq unreachable' };
    }
  }

  // Ollama path
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json() as { models: Array<{ name: string }> };
    const available = data.models.map(m => m.name);
    const modelFound = available.some(n => n === OLLAMA_MODEL || n.startsWith(OLLAMA_MODEL.split(':')[0]));
    if (!modelFound) {
      return { ok: false, model: OLLAMA_MODEL, error: `Model "${OLLAMA_MODEL}" not found. Available: ${available.join(', ')}` };
    }
    return { ok: true, model: `Ollama · ${OLLAMA_MODEL}` };
  } catch (err) {
    return { ok: false, model: OLLAMA_MODEL, error: err instanceof Error ? err.message : 'Ollama unreachable' };
  }
}
