import { NextRequest, NextResponse } from 'next/server';
import { listPosts, createPost } from '@/lib/db-queries';
import type { PostType, PostStatus, PostSource, PostTone } from '@/lib/post-types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const { posts, total } = listPosts({
    status: (s.get('status') as PostStatus) || undefined,
    source: (s.get('source') as PostSource) || undefined,
    post_type: (s.get('postType') as PostType) || undefined,
    from: s.get('from') || undefined,
    to: s.get('to') || undefined,
    limit: Math.min(parseInt(s.get('limit') ?? '20'), 100),
    offset: parseInt(s.get('offset') ?? '0'),
  });
  return NextResponse.json({ posts, total });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const post = createPost({
      source: (body.source as PostSource) ?? 'manual',
      post_type: body.postType as PostType,
      topic: body.topic,
      tone: (body.tone as PostTone) ?? 'professional',
      content: body.content,
      research: body.research ? JSON.stringify(body.research) : undefined,
      status: (body.status as PostStatus) ?? 'draft',
      scheduled_for: body.scheduledFor,
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create post' },
      { status: 500 },
    );
  }
}
