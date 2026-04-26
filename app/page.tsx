import Link from 'next/link';
import { getStats, listPosts, getUsageStats, getDailyUsage, getPostTypeStats } from '@/lib/dashboard-data';
import { POST_TYPES, getTodayPostType, getTomorrowPostType } from '@/lib/post-types';
import { StatusBadge, TypeBadge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import {
  FileText, PenLine, Clock, CheckCircle,
  TrendingUp, Zap, DollarSign, Cpu,
  ArrowRight, ExternalLink, RefreshCw,
  BarChart2, Newspaper,
} from 'lucide-react';
import { formatCostUsd, formatTokens, formatDuration } from '@/lib/cost-calculator';

export const dynamic = 'force-dynamic';

// Simple bar chart via SVG
function MiniBarChart({ data }: { data: { label: string; posts: number; cost_usd: number }[] }) {
  const maxPosts = Math.max(...data.map(d => d.posts), 1);
  const barW = 22;
  const gap = 6;
  const h = 60;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <svg viewBox={`0 0 ${totalW} ${h + 22}`} className="w-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const barH = Math.max((d.posts / maxPosts) * h, d.posts > 0 ? 4 : 1);
        const x = i * (barW + gap);
        return (
          <g key={d.label}>
            <rect
              x={x} y={h - barH} width={barW} height={barH}
              fill={d.posts > 0 ? '#0A66C2' : '#E2E8F0'}
              rx={3}
              className="opacity-90"
            />
            <text x={x + barW / 2} y={h + 14} textAnchor="middle" fontSize="9" fill="#94A3B8">
              {d.label.slice(5)} {/* show MM-DD */}
            </text>
            {d.posts > 0 && (
              <text x={x + barW / 2} y={h - barH - 4} textAnchor="middle" fontSize="9" fill="#64748B">
                {d.posts}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function KpiCard({
  label, value, sub, icon: Icon, accent, trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default async function DashboardPage() {
  const stats = getStats();
  const usage = getUsageStats();
  const daily = getDailyUsage(7);
  const typeStats = getPostTypeStats();
  const { posts: recentPosts } = listPosts({ limit: 5 });
  const { posts: upcomingPosts } = listPosts({ status: 'scheduled', limit: 4 });
  const todayType = getTodayPostType();
  const tomorrowType = getTomorrowPostType();

  const chartData = daily.map(d => ({
    label: d.date,
    posts: d.posts,
    cost_usd: d.cost_usd,
  }));

  const todayPosts = daily[daily.length - 1]?.posts ?? 0;
  const totalCostFormatted = formatCostUsd(usage.total_cost_usd);
  const totalTokensFormatted = formatTokens(usage.total_input_tokens + usage.total_output_tokens);
  const avgTimeFormatted = formatDuration(Math.round(usage.avg_generation_time_ms));

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Piyush
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · PostPilot Dashboard
          </p>
        </div>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 bg-linkedin text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-linkedin-hover transition-colors shadow-sm"
        >
          <Zap className="w-4 h-4" />
          Generate Post
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Posts"
          value={String(stats.total)}
          sub={`${stats.posted} published · ${stats.draft} drafts`}
          icon={FileText}
          accent="bg-linkedin-light text-linkedin"
          trend={todayPosts > 0 ? `+${todayPosts} today` : undefined}
        />
        <KpiCard
          label="API Spend"
          value={totalCostFormatted}
          sub={`Avg ${formatCostUsd(usage.avg_cost_per_post)} / post`}
          icon={DollarSign}
          accent="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Tokens Used"
          value={totalTokensFormatted}
          sub={`${formatTokens(usage.total_input_tokens)} in · ${formatTokens(usage.total_output_tokens)} out`}
          icon={Cpu}
          accent="bg-violet-50 text-violet-600"
        />
        <KpiCard
          label="Avg Generation Time"
          value={avgTimeFormatted}
          sub={`${usage.total_generations} total generations`}
          icon={Clock}
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Generation Activity</h2>
              <p className="text-xs text-slate-400 mt-0.5">Posts created — last 7 days</p>
            </div>
            <Link href="/analytics" className="text-xs text-linkedin hover:underline flex items-center gap-1">
              Full analytics <BarChart2 className="w-3 h-3" />
            </Link>
          </div>
          <MiniBarChart data={chartData} />
        </div>

        {/* Today's schedule */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Today's Content Plan</div>
            <div className="bg-gradient-to-r from-[#0A66C2] to-[#0EA5E9] rounded-lg p-4 text-white">
              <div className="text-xs font-medium opacity-80 mb-0.5">Scheduled type</div>
              <div className="text-base font-bold">{POST_TYPES[todayType].label}</div>
              <div className="text-xs opacity-70 mt-1">Tomorrow: {POST_TYPES[tomorrowType].label}</div>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="space-y-2">
            {[
              { label: 'Draft', value: stats.draft, color: 'bg-amber-400' },
              { label: 'Scheduled', value: stats.scheduled, color: 'bg-linkedin' },
              { label: 'Published', value: stats.posted, color: 'bg-emerald-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-slate-600 flex-1">{label}</span>
                <span className="text-xs font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Post type breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Post Type Breakdown</h2>
          {typeStats.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-4">No data yet</div>
          ) : (
            <div className="space-y-3">
              {typeStats.slice(0, 5).map(t => {
                const config = POST_TYPES[t.post_type as keyof typeof POST_TYPES];
                const label = config?.label ?? t.post_type;
                const pct = stats.total > 0 ? Math.round((t.count / stats.total) * 100) : 0;
                return (
                  <div key={t.post_type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">{label}</span>
                      <span className="text-xs font-semibold text-slate-800">{t.count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linkedin rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: config?.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming scheduled */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Upcoming Scheduled</h2>
            <Link href="/scheduled" className="text-xs text-linkedin hover:underline">View all</Link>
          </div>
          {upcomingPosts.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No scheduled posts</p>
              <p className="text-xs text-slate-300 mt-0.5">n8n pushes drafts here automatically</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingPosts.map(post => (
                <div key={post.id} className="flex items-center gap-2.5 py-1.5 border-b border-slate-50 last:border-0">
                  <TypeBadge type={post.post_type as Parameters<typeof TypeBadge>[0]['type']} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 truncate">{post.topic ?? post.content.slice(0, 40)}</p>
                    {post.scheduled_for && (
                      <p className="text-[10px] text-slate-400">{post.scheduled_for}</p>
                    )}
                  </div>
                  <StatusBadge status={post.status as Parameters<typeof StatusBadge>[0]['status']} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent posts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Recent Posts</h2>
            <Link href="/posts" className="text-xs text-linkedin hover:underline">View all</Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="text-center py-6">
              <PenLine className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No posts yet</p>
              <Link href="/generate" className="text-xs text-linkedin hover:underline">Generate your first one</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentPosts.map(post => (
                <div key={post.id} className="flex items-start gap-2.5 py-1.5 border-b border-slate-50 last:border-0">
                  <TypeBadge type={post.post_type as Parameters<typeof TypeBadge>[0]['type']} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{post.content}</p>
                    {post.total_cost_usd > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatCostUsd(post.total_cost_usd)} · {formatDuration(post.generation_time_ms)}</p>
                    )}
                  </div>
                  <StatusBadge status={post.status as Parameters<typeof StatusBadge>[0]['status']} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* News teaser row */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-linkedin" />
            <h2 className="text-sm font-semibold text-slate-800">Intelligence Feed</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Creatio + BFSI</span>
          </div>
          <Link href="/news" className="text-xs text-linkedin hover:underline flex items-center gap-1">
            Full feed <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Creatio AI-Native CRM leads 2025 enterprise CRM landscape', source: 'Creatio News', tag: 'Platform' },
            { title: 'BFSI sector embraces no-code automation for claims & underwriting workflows', source: 'Industry Insight', tag: 'BFSI' },
            { title: 'SMB financial firms report 3x ROI from CRM + AI automation stack', source: 'Market Research', tag: 'ROI' },
          ].map((item, i) => (
            <Link key={i} href="/news" className="group p-3.5 rounded-lg border border-slate-200 hover:border-linkedin/30 hover:bg-linkedin-light/20 transition-all">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.source}</span>
              <p className="text-xs font-medium text-slate-700 mt-1.5 leading-snug group-hover:text-linkedin transition-colors">
                {item.title}
              </p>
              <span className="inline-block mt-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{item.tag}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
