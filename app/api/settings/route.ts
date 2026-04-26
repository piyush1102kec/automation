import { NextRequest, NextResponse } from 'next/server';
import {
  listCustomPostTypes, upsertCustomPostType, deleteCustomPostType,
  listPostTypeOverrides, upsertPostTypeOverride,
  listCustomTones, upsertCustomTone, deleteCustomTone,
  listTopicShortcuts, addTopicShortcut, deleteTopicShortcut,
} from '@/lib/db-queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const resource = req.nextUrl.searchParams.get('resource');
  const postType = req.nextUrl.searchParams.get('postType');

  switch (resource) {
    case 'post-types':
      return NextResponse.json({
        custom: listCustomPostTypes(),
        overrides: listPostTypeOverrides(),
      });
    case 'tones':
      return NextResponse.json({ custom: listCustomTones() });
    case 'topics':
      return NextResponse.json({ topics: listTopicShortcuts(postType ?? undefined) });
    default:
      return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { resource: string; action?: string; [k: string]: unknown };

  switch (body.resource) {
    case 'post-types': {
      if (body.action === 'override') {
        upsertPostTypeOverride({
          post_type_key: body.post_type_key as string,
          default_topic: body.default_topic as string | null,
          system_prompt: body.system_prompt as string | null,
          content_guidance: body.content_guidance as string | null,
        });
      } else {
        upsertCustomPostType({
          id: body.id as string,
          label: body.label as string,
          color: body.color as string ?? '#6366F1',
          bg_color: body.bg_color as string ?? 'bg-indigo-100',
          text_color: body.text_color as string ?? 'text-indigo-700',
          days: body.days as string ?? '[]',
          default_topic: body.default_topic as string | null ?? null,
          system_prompt: body.system_prompt as string ?? '',
          content_guidance: body.content_guidance as string ?? '',
          is_active: 1,
        });
      }
      return NextResponse.json({ ok: true });
    }

    case 'tones': {
      upsertCustomTone({
        id: body.id as string,
        label: body.label as string,
        instruction: body.instruction as string,
        is_active: 1,
      });
      return NextResponse.json({ ok: true });
    }

    case 'topics': {
      addTopicShortcut(body.post_type as string, body.topic as string);
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const resource = req.nextUrl.searchParams.get('resource');
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  switch (resource) {
    case 'post-types':
      deleteCustomPostType(id);
      return NextResponse.json({ ok: true });
    case 'tones':
      deleteCustomTone(id);
      return NextResponse.json({ ok: true });
    case 'topics':
      deleteTopicShortcut(Number(id));
      return NextResponse.json({ ok: true });
    default:
      return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  }
}
