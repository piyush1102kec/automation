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
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-linkedin" />
          Scheduled Posts
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Posts drafted by your n8n automation, ready for review
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-700">
          <strong>How this works:</strong> Your n8n workflow runs daily and pushes drafted posts here via webhook.
          Review, edit if needed, copy, and post to LinkedIn manually.
          Mark as <strong>Posted</strong> once published.
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse h-32" />
          ))}
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No scheduled posts yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your n8n workflow will push posts here each day.
          </p>
          <div className="mt-4 bg-gray-50 rounded-lg p-3 text-left text-xs text-gray-500 max-w-sm mx-auto">
            <strong className="block mb-1">n8n Webhook URL:</strong>
            <code className="bg-gray-100 px-2 py-1 rounded text-gray-700 block break-all">
              http://localhost:3000/api/webhook
            </code>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
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
