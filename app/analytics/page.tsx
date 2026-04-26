import { getUsageStats, getDailyUsage, getPostTypeStats, getTopExpensivePosts } from '@/lib/dashboard-data';
import { POST_TYPES } from '@/lib/post-types';
import { formatCostUsd, formatTokens, formatDuration } from '@/lib/cost-calculator';
import { format } from 'date-fns';
import { BarChart2, DollarSign, Cpu, Clock, TrendingUp, Zap } from 'lucide-react';
import { TypeBadge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

interface DailyData {
  date: string;
  posts: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
}

function BarChart({ data, valueKey, label, formatter }: {
  data: DailyData[];
  valueKey: keyof DailyData;
  label: string;
  formatter: (v: number) => string;
}) {
  const values = data.map(d => Number(d[valueKey]));
  const max = Math.max(...values, 0.0001);
  const barW = 28;
  const gap = 8;
  const h = 80;
  const total = data.length * (barW + gap) - gap;

  return (
    <div>
      <div className="text-xs font-medium text-slate-500 mb-3">{label}</div>
      <svg viewBox={`0 0 ${total} ${h + 24}`} className="w-full" preserveAspectRatio="none">
        {data.map((d, i) => {
          const v = Number(d[valueKey]);
          const barH = Math.max((v / max) * h, v > 0 ? 3 : 1);
          const x = i * (barW + gap);
          return (
            <g key={d.date}>
              <rect x={x} y={h - barH} width={barW} height={barH}
                fill={v > 0 ? '#0A66C2' : '#E2E8F0'} rx={3} opacity={0.85} />
              <text x={x + barW / 2} y={h + 14} textAnchor="middle" fontSize="9" fill="#94A3B8">
                {d.date.slice(5)}
              </text>
              {v > 0 && (
                <text x={x + barW / 2} y={h - barH - 4} textAnchor="middle" fontSize="8" fill="#64748B">
                  {formatter(v)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AnalyticsPage() {
  const usage = getUsageStats();
  const daily = getDailyUsage(14);
  const typeStats = getPostTypeStats();
  const topPosts = getTopExpensivePosts(5);

  const totalTokens = usage.total_input_tokens + usage.total_output_tokens;
  const inputPct = totalTokens > 0 ? Math.round((usage.total_input_tokens / totalTokens) * 100) : 50;

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="w-5 h-5 text-linkedin" />
          <h1 className="text-xl font-bold text-slate-900">Analytics & API Usage</h1>
        </div>
        <p className="text-sm text-slate-500">Lifetime API consumption, cost breakdown, and generation performance</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total API Spend" value={formatCostUsd(usage.total_cost_usd)}
          sub={`${usage.total_generations} generations`} icon={DollarSign} color="bg-amber-50 text-amber-600" />
        <StatCard label="Total Tokens" value={formatTokens(totalTokens)}
          sub={`${formatTokens(usage.total_input_tokens)} in · ${formatTokens(usage.total_output_tokens)} out`}
          icon={Cpu} color="bg-violet-50 text-violet-600" />
        <StatCard label="Avg Cost / Post" value={formatCostUsd(usage.avg_cost_per_post)}
          sub="Across all generations" icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Avg Generation Time" value={formatDuration(Math.round(usage.avg_generation_time_ms))}
          sub="Research + drafting" icon={Clock} color="bg-sky-50 text-sky-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Daily posts bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-800">Daily Generations — Last 14 Days</h2>
          </div>
          <BarChart
            data={daily}
            valueKey="posts"
            label="Posts created per day"
            formatter={v => String(v)}
          />
        </div>

        {/* Daily cost bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-800">Daily API Cost — Last 14 Days</h2>
          </div>
          <BarChart
            data={daily}
            valueKey="cost_usd"
            label="USD spend per day"
            formatter={v => v > 0 ? `$${v.toFixed(3)}` : ''}
          />
        </div>
      </div>

      {/* Token breakdown + Post type stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Token breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Token Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                <span>Input tokens (prompts + research)</span>
                <span className="font-semibold">{inputPct}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-linkedin rounded-full" style={{ width: `${inputPct}%` }} />
              </div>
              <div className="text-xs text-slate-400 mt-1">{formatTokens(usage.total_input_tokens)} tokens · ${((usage.total_input_tokens / 1_000_000) * 3.0).toFixed(4)}</div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                <span>Output tokens (generated content)</span>
                <span className="font-semibold">{100 - inputPct}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${100 - inputPct}%` }} />
              </div>
              <div className="text-xs text-slate-400 mt-1">{formatTokens(usage.total_output_tokens)} tokens · ${((usage.total_output_tokens / 1_000_000) * 15.0).toFixed(4)}</div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-2">Pricing (claude-sonnet-4-5)</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Input</span><span className="font-mono">$3.00 / MTok</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Output</span><span className="font-mono">$15.00 / MTok</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post type cost breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Cost by Post Type</h2>
          {typeStats.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">No data yet. Generate some posts first.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 pb-2.5">Post Type</th>
                    <th className="text-right text-xs font-semibold text-slate-500 pb-2.5">Count</th>
                    <th className="text-right text-xs font-semibold text-slate-500 pb-2.5">Tokens</th>
                    <th className="text-right text-xs font-semibold text-slate-500 pb-2.5">Total Cost</th>
                    <th className="text-right text-xs font-semibold text-slate-500 pb-2.5">Avg Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {typeStats.map(t => {
                    const config = POST_TYPES[t.post_type as keyof typeof POST_TYPES];
                    return (
                      <tr key={t.post_type} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-2.5">
                          <TypeBadge type={t.post_type as Parameters<typeof TypeBadge>[0]['type']} />
                        </td>
                        <td className="py-2.5 text-right text-sm font-semibold text-slate-800">{t.count}</td>
                        <td className="py-2.5 text-right text-xs text-slate-600 font-mono">{formatTokens(t.total_tokens)}</td>
                        <td className="py-2.5 text-right text-xs font-semibold text-slate-800 font-mono">{formatCostUsd(t.total_cost_usd)}</td>
                        <td className="py-2.5 text-right text-xs text-slate-500 font-mono">
                          {t.count > 0 ? formatCostUsd(t.total_cost_usd / t.count) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top expensive posts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-slate-800">Highest Cost Generations</h2>
        </div>
        {topPosts.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6">No tracked generations yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 pb-2.5">Post</th>
                  <th className="text-left text-xs font-semibold text-slate-500 pb-2.5">Type</th>
                  <th className="text-right text-xs font-semibold text-slate-500 pb-2.5">Input</th>
                  <th className="text-right text-xs font-semibold text-slate-500 pb-2.5">Output</th>
                  <th className="text-right text-xs font-semibold text-slate-500 pb-2.5">Time</th>
                  <th className="text-right text-xs font-semibold text-slate-500 pb-2.5">Cost</th>
                  <th className="text-right text-xs font-semibold text-slate-500 pb-2.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {topPosts.map(post => (
                  <tr key={post.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-2.5 pr-4 max-w-xs">
                      <p className="text-xs text-slate-700 truncate">{post.topic ?? post.content.slice(0, 50)}</p>
                    </td>
                    <td className="py-2.5">
                      <TypeBadge type={post.post_type as Parameters<typeof TypeBadge>[0]['type']} />
                    </td>
                    <td className="py-2.5 text-right text-xs font-mono text-slate-600">{formatTokens(post.input_tokens)}</td>
                    <td className="py-2.5 text-right text-xs font-mono text-slate-600">{formatTokens(post.output_tokens)}</td>
                    <td className="py-2.5 text-right text-xs font-mono text-slate-600">{formatDuration(post.generation_time_ms)}</td>
                    <td className="py-2.5 text-right text-xs font-mono font-bold text-amber-600">{formatCostUsd(post.total_cost_usd)}</td>
                    <td className="py-2.5 text-right text-xs text-slate-400">
                      {format(new Date(post.created_at), 'MMM d')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
