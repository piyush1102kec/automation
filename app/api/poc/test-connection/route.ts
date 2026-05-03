import { NextRequest, NextResponse } from 'next/server';
import { N8nClient, N8nApiError } from '@/lib/n8n-client';
import { checkOllamaHealth } from '@/lib/workflow-generator';
import type { ConnectionConfig } from '@/types/n8n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<ConnectionConfig>;

    const baseUrl = body.baseUrl ?? process.env.N8N_BASE_URL ?? '';
    const apiKey  = body.apiKey  ?? process.env.N8N_API_KEY  ?? '';

    if (!baseUrl) return NextResponse.json({ connected: false, error: 'Base URL is required' });
    if (!apiKey)  return NextResponse.json({ connected: false, error: 'API key is required' });

    // Test n8n connection
    const client = new N8nClient({ baseUrl, apiKey });
    const n8nResult = await client.testConnection();

    // Test Ollama health in parallel
    const ollamaResult = await checkOllamaHealth();

    return NextResponse.json({
      connected:     true,
      workflowCount: n8nResult.workflowCount,
      ollama: {
        ok:    ollamaResult.ok,
        model: ollamaResult.model,
        error: ollamaResult.error,
      },
    });
  } catch (err) {
    const message = err instanceof N8nApiError ? err.message : 'Could not connect to n8n';
    return NextResponse.json({ connected: false, error: message });
  }
}
