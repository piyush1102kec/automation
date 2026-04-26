'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import type { Post } from '@/lib/db-queries';
import { Clock, Info } from 'lucide-react';

export default function ScheduledPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/posts?source=scheduled&limit=50');
    const data = await res.json();
    setPosts(data.posts);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleUpdate = (updated: Post) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };
  const handleDelete = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const grouped = posts.reduce<Record<string, Post[]>>((acc, post) => {
    const key = post.scheduled_for ?? 'Unscheduled';
    if (!acc[key]) acc[key] = [];
    acc[key].push(post);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="p-6 max-w-[900px]">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-linkedin" />
          <h1 className="text-xl font-bold text-slate-900">Scheduled Posts</h1>
        </div>
        <p className="text-sm text-slate-500">
          Posts drafted by your n8n automation, ready for review and publishing
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-linkedin-light border border-linkedin/20 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-linkedin mt-0.5 flex-shrink-0" />
        <div className="text-xs text-linkedin/80">
          <strong>How this works:</strong> Your n8n workflow runs daily and pushes drafted posts here via webhook.
          Review, edit if needed, copy, and post to LinkedIn manually.
          Mark as <strong>Published</strong> once live.
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse h-32" />
          ))}
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-14 text-center">
          <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No scheduled posts yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Your n8n workflow will push posts here each day.
          </p>
          <div className="mt-4 bg-slate-50 rounded-xl p-3 text-left text-xs text-slate-500 max-w-sm mx-auto border border-slate-200">
            <strong className="block mb-1 text-slate-700">n8n Webhook URL:</strong>
            <code className="bg-white border border-slate-200 px-2 py-1 rounded font-mono text-slate-700 block break-all">
              http://localhost:3000/api/webhook
            </code>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-linkedin" />
                {date}
              </h2>
              <div className="space-y-3">
                {grouped[date].map(post => (
                  <PostCard key={post.id} post={post} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
