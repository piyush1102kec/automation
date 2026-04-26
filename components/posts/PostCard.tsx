'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, SkipForward, Trash2, ChevronDown, ChevronUp, Calendar, DollarSign, Clock } from 'lucide-react';
import { StatusBadge, TypeBadge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { Button } from '@/components/ui/Button';
import type { Post } from '@/lib/db-queries';
import { formatCostUsd, formatDuration, formatTokens } from '@/lib/cost-calculator';

interface PostCardProps {
  post: Post;
  onUpdate?: (updated: Post) => void;
  onDelete?: (id: number) => void;
}

export function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [loading, setLoading] = useState(false);

  const patch = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      onUpdate?.(json.post);
    } finally {
      setLoading(false);
    }
  };

  const markPosted = () => patch({ status: 'posted', posted_at: new Date().toISOString() });
  const markSkipped = () => patch({ status: 'skipped' });

  const saveEdit = async () => {
    await patch({ content: editContent });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    setLoading(true);
    await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    onDelete?.(post.id);
  };

  const hasUsageData = post.total_cost_usd > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={post.post_type as Parameters<typeof TypeBadge>[0]['type']} />
          <StatusBadge status={post.status as Parameters<typeof StatusBadge>[0]['status']} />
          {post.source === 'scheduled' && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              <Calendar className="w-3 h-3" />
              Auto
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {hasUsageData && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatCostUsd(post.total_cost_usd)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(post.generation_time_ms)}
              </span>
            </div>
          )}
          <span className="text-xs text-slate-400">
            {format(new Date(post.created_at), 'MMM d, h:mm a')}
          </span>
        </div>
      </div>

      {/* Topic */}
      {post.topic && (
        <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100">
          <span className="text-xs text-slate-400">Topic: </span>
          <span className="text-xs text-slate-700 font-medium">{post.topic}</span>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3.5">
        {editing ? (
          <textarea
            className="w-full text-sm text-slate-800 leading-relaxed border border-linkedin rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-linkedin/20 min-h-[160px]"
            rows={8}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
        ) : (
          <p className={`text-sm text-slate-700 leading-relaxed whitespace-pre-wrap ${!expanded ? 'line-clamp-4' : ''}`}>
            {post.content}
          </p>
        )}

        {!editing && post.content.length > 250 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-linkedin mt-2 hover:underline font-medium"
          >
            {expanded
              ? <><ChevronUp className="w-3.5 h-3.5" />Show less</>
              : <><ChevronDown className="w-3.5 h-3.5" />Show more</>
            }
          </button>
        )}
      </div>

      {/* Token details (expandable) */}
      {hasUsageData && (
        <div className="px-4 pb-2 flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>{formatTokens(post.input_tokens + post.output_tokens)} tokens</span>
          <span>·</span>
          <span>{post.model ?? 'claude-sonnet-4-5'}</span>
        </div>
      )}

      {post.scheduled_for && (
        <div className="px-4 pb-2 text-xs text-slate-500">
          Scheduled: <strong>{post.scheduled_for}</strong>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 flex-wrap">
        <CopyButton text={post.content} />

        {editing ? (
          <>
            <Button size="sm" onClick={saveEdit} loading={loading}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditContent(post.content); }}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>

            {post.status !== 'posted' && (
              <Button size="sm" variant="ghost" onClick={markPosted} loading={loading}
                className="text-emerald-600 hover:bg-emerald-50">
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Published
              </Button>
            )}

            {post.status === 'scheduled' && (
              <Button size="sm" variant="ghost" onClick={markSkipped} className="text-slate-500">
                <SkipForward className="w-3.5 h-3.5" />
                Skip
              </Button>
            )}

            <button
              onClick={handleDelete}
              className="ml-auto text-slate-300 hover:text-red-400 transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
