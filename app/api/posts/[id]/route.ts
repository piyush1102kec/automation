import { NextRequest, NextResponse } from 'next/server';
import { getPost, updatePost, deletePost } from '@/lib/db-queries';
import type { PostStatus, PostTone } from '@/lib/post-types';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = getPost(parseInt(params.id));
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const id = parseInt(params.id);

  let posted_at = body.posted_at;
  if (body.status === 'posted' && !posted_at) {
    posted_at = new Date().toISOString();
  }

  const post = updatePost(id, {
    content: body.content,
    status: body.status as PostStatus,
    posted_at,
    topic: body.topic,
    tone: body.tone as PostTone,
  });

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = deletePost(parseInt(params.id));
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
