import { NextRequest, NextResponse } from 'next/server';
import { listSchedules, getSchedule, createSchedule, updateSchedule, deleteSchedule } from '@/lib/db-queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get('platform') ?? undefined;
  return NextResponse.json({ schedules: listSchedules(platform) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, post_type, frequency, custom_days, time, tone, default_topic } = body;

    if (!platform || !post_type || !frequency || !time) {
      return NextResponse.json({ error: 'platform, post_type, frequency and time are required' }, { status: 400 });
    }

    const schedule = createSchedule({
      platform,
      post_type,
      frequency,
      custom_days: JSON.stringify(custom_days ?? []),
      time,
      tone: tone ?? 'professional',
      default_topic: default_topic ?? null,
      is_active: 1,
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = Number(req.nextUrl.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const body = await req.json();
    const schedule = updateSchedule(id, {
      ...body,
      custom_days: body.custom_days ? JSON.stringify(body.custom_days) : undefined,
    });
    if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ schedule });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const deleted = deleteSchedule(id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
