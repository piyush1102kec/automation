'use client';

import { cn } from '@/lib/cn';
import type { PostStatus, PostType } from '@/lib/post-types';
import { POST_TYPES } from '@/lib/post-types';

const STATUS_STYLES: Record<PostStatus, string> = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  posted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  skipped: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  posted: 'Published',
  skipped: 'Skipped',
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function TypeBadge({ type }: { type: PostType }) {
  const config = POST_TYPES[type];
  if (!config) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
        {type}
      </span>
    );
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.bgColor, config.textColor)}>
      {config.label}
    </span>
  );
}
