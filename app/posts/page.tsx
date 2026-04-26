'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import type { Post } from '@/lib/db-queries';
import type { PostStatus, PostType } from '@/lib/post-types';
import { POST_TYPES } from '@/lib/post-types';
import { BookOpen, Search, Filter } from 'lucide-react';

const STATUSES: { value: PostStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'posted', label: 'Published' },
  { value: 'skipped', label: 'Skipped' },
];

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PostStatus | ''>('');
  const [postType, setPostType] = useState<PostType | ''>('');
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (status) params.set('status', status);
    if (postType) params.set('postType', postType);
    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts);
    setTotal(data.total);
    setLoading(false);
  }, [status, postType, offset]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setOffset(0); }, [status, postType]);

  const handleUpdate = (updated: Post) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDelete = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setTotal(t => t - 1);
  };

  const hasFilters = status || postType;

  return (
    <div className="p-6 max-w-[900px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-linkedin" />
          <h1 className="text-xl font-bold text-slate-900">Content Library</h1>
        </div>
        <p className="text-sm text-slate-500">{total} posts · all sources</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={status}
            onChange={e => setStatus(e.target.value as PostStatus | '')}
            className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-linkedin/20 appearance-none cursor-pointer"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <select
          value={postType}
          onChange={e => setPostType(e.target.value as PostType | '')}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-linkedin/20 cursor-pointer"
        >
          <option value="">All Types</option>
          {(Object.entries(POST_TYPES) as [PostType, { label: string }][]).map(([key, c]) => (
            <option key={key} value={key}>{c.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setStatus(''); setPostType(''); }}
            className="text-xs text-slate-400 hover:text-slate-700 border border-slate-200 bg-white px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400">{total} results</span>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-24 bg-slate-100 rounded" />
                <div className="h-5 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-3.5 bg-slate-100 rounded mb-2 w-full" />
              <div className="h-3.5 bg-slate-100 rounded mb-2 w-3/4" />
              <div className="h-3.5 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-14 text-center">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No posts found</p>
          <p className="text-sm text-slate-400 mt-1">
            {hasFilters ? 'Try adjusting your filters.' : 'Generate your first post to build your library.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-xs text-slate-500">
            {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
