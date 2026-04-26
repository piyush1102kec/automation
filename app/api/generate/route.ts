import { NextRequest, NextResponse } from 'next/server';
import { generatePostStream, type GenerateMeta } from '@/lib/post-generator';
import { createPost } from '@/lib/db-queries';
import type { PostType, PostTone } from '@/lib/post-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postType, topic, tone } = body as {
      postType: PostType;
      topic: string;
      tone: PostTone;
    };

    if (!postType || !topic) {
      return NextResponse.json({ error: 'postType and topic are required' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    let fullContent = '';
    let meta: GenerateMeta | null = null;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generatePostStream(postType, topic, tone ?? 'professional')) {
            if (chunk.includes('__META__')) {
              const parts = chunk.split('__META__');
              const textPart = parts[0];
              if (textPart) {
                fullContent += textPart;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: textPart })}\n\n`));
              }
              try {
                meta = JSON.parse(parts[1]) as GenerateMeta;
              } catch { /* ignore */ }
            } else {
              fullContent += chunk;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`));
            }
          }

          // Save post with full token + cost data
          let postId: number | undefined;
          try {
            const post = createPost({
              source: 'manual',
              post_type: postType,
              topic,
              tone: tone ?? 'professional',
              content: fullContent.trim(),
              research: meta ? JSON.stringify({ query: meta.query, results: meta.results, summary: meta.researchSummary }) : undefined,
              status: 'draft',
              input_tokens: meta?.inputTokens ?? 0,
              output_tokens: meta?.outputTokens ?? 0,
              generation_time_ms: meta?.timeMs ?? 0,
              total_cost_usd: meta?.costUsd ?? 0,
              model: meta?.model ?? 'claude-sonnet-4-5',
            });
            postId = post.id;
          } catch { /* DB failure shouldn't break stream */ }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            postId,
            meta: meta ? {
              inputTokens: meta.inputTokens,
              outputTokens: meta.outputTokens,
              timeMs: meta.timeMs,
              costUsd: meta.costUsd,
            } : null,
          })}\n\n`));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Generation failed';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 },
    );
  }
}
