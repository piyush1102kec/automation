import { NextRequest, NextResponse } from 'next/server';
import { generateWorkflow } from '@/lib/workflow-generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json() as { prompt?: string };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const result = await generateWorkflow(prompt.trim());
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
