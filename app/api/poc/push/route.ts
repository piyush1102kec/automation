import { NextRequest, NextResponse } from 'next/server';
import { N8nClient, N8nApiError } from '@/lib/n8n-client';
import type { N8nWorkflow, ConnectionConfig } from '@/types/n8n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workflow, connectionConfig } = body;

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow is required' }, { status: 400 });
    }

    // Get connection config from request body or environment variables
    const baseUrl = connectionConfig?.baseUrl ?? process.env.N8N_BASE_URL ?? '';
    const apiKey = connectionConfig?.apiKey ?? process.env.N8N_API_KEY ?? '';

    if (!baseUrl) {
      return NextResponse.json({ error: 'n8n Base URL is required' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'n8n API key is required' }, { status: 400 });
    }

    const client = new N8nClient({ baseUrl, apiKey });
    
    // Push the workflow to n8n
    const result = await client.pushWorkflow(workflow, false); // Don't activate by default
    
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to push workflow to n8n';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}