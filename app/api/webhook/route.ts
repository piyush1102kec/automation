import { NextRequest, NextResponse } from 'next/server';
import { upsertFromWebhook } from '@/lib/db-queries';
import type { PostType } from '@/lib/post-types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate secret
    const secret = process.env.WEBHOOK_SECRET;
    if (secret && body.secret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!body.n8n_run_id || !body.content || !body.post_type) {
      return NextResponse.json(
        { error: 'Missing required fields: n8n_run_id, content, post_type' },
        { status: 400 },
      );
    }

    const { post, duplicate } = upsertFromWebhook({
      n8n_run_id: body.n8n_run_id,
      post_type: body.post_type as PostType,
      topic: body.topic,
      content: body.content,
      research: body.research ? JSON.stringify(body.research) : undefined,
      scheduled_for: body.scheduled_for,
    });

    return NextResponse.json({ received: true, postId: post.id, duplicate });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 },
    );
  }
}
