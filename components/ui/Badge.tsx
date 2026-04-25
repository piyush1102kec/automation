'use client';

import { cn } from '@/lib/cn';
import type { PostStatus, PostType } from '@/lib/post-types';
import { POST_TYPES } from '@/lib/post-types';

const STATUS_STYLES: Record<PostStatus, string> = {
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  posted: 'bg-green-100 text-green-700 border-green-200',
  skipped: 'bg-red-100 text-red-600 border-red-200',
};

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  posted: 'Posted',
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
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.bgColor, config.textColor)}>
      {config.label}
    </span>
  );
}
