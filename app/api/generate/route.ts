import { NextRequest, NextResponse } from 'next/server';
import { generatePostStream } from '@/lib/post-generator';
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

    // Stream the response
    const encoder = new TextEncoder();
    let fullContent = '';
    let researchData: unknown = null;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generatePostStream(postType, topic, tone ?? 'professional')) {
            // Detect research metadata marker
            if (chunk.includes('__RESEARCH__')) {
              const parts = chunk.split('__RESEARCH__');
              if (parts[0]) {
                fullContent += parts[0];
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: parts[0] })}\n\n`));
              }
              try {
                researchData = JSON.parse(parts[1]);
              } catch { /* ignore */ }
            } else {
              fullContent += chunk;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`));
            }
          }

          // Save to DB
          let postId: number | undefined;
          try {
            const post = createPost({
              source: 'manual',
              post_type: postType,
              topic,
              tone: tone ?? 'professional',
              content: fullContent.trim(),
              research: researchData ? JSON.stringify(researchData) : undefined,
              status: 'draft',
            });
            postId = post.id;
          } catch { /* DB save failure shouldn't break stream */ }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', postId })}\n\n`));
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
