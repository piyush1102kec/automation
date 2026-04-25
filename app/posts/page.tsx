'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import type { Post } from '@/lib/db-queries';
import type { PostStatus, PostType } from '@/lib/post-types';
import { POST_TYPES } from '@/lib/post-types';
import { History, Search } from 'lucide-react';

const STATUSES: { value: PostStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'posted', label: 'Posted' },
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

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6 text-linkedin" />
          All Posts
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} posts in your library</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={status}
            onChange={e => setStatus(e.target.value as PostStatus | '')}
            className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-linkedin focus:ring-opacity-30 appearance-none"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <select
          value={postType}
          onChange={e => setPostType(e.target.value as PostType | '')}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-linkedin focus:ring-opacity-30"
        >
          <option value="">All Types</option>
          {(Object.entries(POST_TYPES) as [PostType, { label: string }][]).map(([key, c]) => (
            <option key={key} value={key}>{c.label}</option>
          ))}
        </select>

        {(status || postType) && (
          <button
            onClick={() => { setStatus(''); setPostType(''); }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-24 bg-gray-100 rounded" />
                <div className="h-5 w-16 bg-gray-100 rounded" />
              </div>
              <div className="h-4 bg-gray-100 rounded mb-2 w-full" />
              <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No posts found</p>
          <p className="text-sm text-gray-400 mt-1">
            {status || postType ? 'Try different filters.' : 'Generate your first post to get started.'}
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
        <div className="flex items-center justify-between mt-5">
          <span className="text-sm text-gray-500">
            Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
