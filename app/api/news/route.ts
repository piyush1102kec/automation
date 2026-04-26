import { NextRequest, NextResponse } from 'next/server';
import { getOrRefreshCreatioNews, getOrRefreshBfsiInsights } from '@/lib/news-fetcher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get('refresh') === '1';

  const [creatio, bfsi] = await Promise.all([
    getOrRefreshCreatioNews(force),
    getOrRefreshBfsiInsights(force),
  ]);

  return NextResponse.json({ creatio, bfsi });
}
