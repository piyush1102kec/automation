import Link from 'next/link';
import { getStats, listPosts } from '@/lib/db-queries';
import { POST_TYPES, getTodayPostType, getTomorrowPostType } from '@/lib/post-types';
import { StatusBadge, TypeBadge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { PenLine, Clock, CheckCircle, FileText, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const stats = getStats();
  const { posts: recentPosts } = listPosts({ limit: 5 });
  const { posts: upcomingPosts } = listPosts({ status: 'scheduled', limit: 3 });
  const todayType = getTodayPostType();
  const tomorrowType = getTomorrowPostType();

  const statCards = [
    { label: 'Total Posts', value: stats.total, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
    { label: 'Drafts', value: stats.draft, icon: PenLine, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Posted', value: stats.posted, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Today's context banner */}
      <div className="bg-linkedin rounded-xl p-4 text-white mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium opacity-80 mb-0.5">Today's post type</div>
          <div className="text-lg font-bold">{POST_TYPES[todayType].label}</div>
          <div className="text-sm opacity-70 mt-0.5">Tomorrow: {POST_TYPES[tomorrowType].label}</div>
        </div>
        <Link
          href="/generate"
          className="bg-white text-linkedin font-semibold text-sm px-4 py-2 rounded-full hover:bg-linkedin-light transition-colors flex items-center gap-1.5"
        >
          Generate Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming scheduled */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Upcoming Scheduled</h2>
            <Link href="/scheduled" className="text-xs text-linkedin hover:underline">View all</Link>
          </div>
          {upcomingPosts.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              No scheduled posts yet.<br />
              <span className="text-xs">n8n will push drafts here automatically.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingPosts.map(post => (
                <div key={post.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <TypeBadge type={post.post_type as Parameters<typeof TypeBadge>[0]['type']} />
                  <span className="text-xs text-gray-600 flex-1 truncate">{post.scheduled_for}</span>
                  <StatusBadge status={post.status as Parameters<typeof StatusBadge>[0]['status']} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Recent Posts</h2>
            <Link href="/posts" className="text-xs text-linkedin hover:underline">View all</Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              No posts yet.{' '}
              <Link href="/generate" className="text-linkedin hover:underline">Generate your first one.</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPosts.map(post => (
                <div key={post.id} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <TypeBadge type={post.post_type as Parameters<typeof TypeBadge>[0]['type']} />
                  <p className="text-xs text-gray-600 flex-1 line-clamp-2 leading-relaxed">{post.content}</p>
                  <StatusBadge status={post.status as Parameters<typeof StatusBadge>[0]['status']} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { href: '/generate', label: 'Generate Post', desc: 'Create on-demand', color: 'border-linkedin bg-linkedin-light' },
          { href: '/scheduled', label: 'Scheduled Posts', desc: 'From n8n automation', color: 'border-gray-200 bg-white' },
          { href: '/posts', label: 'All Posts', desc: 'Manage your library', color: 'border-gray-200 bg-white' },
        ].map(({ href, label, desc, color }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-xl border p-3.5 hover:shadow-sm transition-shadow ${color}`}
          >
            <div className="text-sm font-semibold text-gray-800">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
