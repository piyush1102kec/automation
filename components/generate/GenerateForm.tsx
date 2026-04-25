'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { POST_TYPES, TONES, getTodayPostType, type PostType, type PostTone } from '@/lib/post-types';

interface GenerateFormProps {
  onGenerate: (postType: PostType, topic: string, tone: PostTone) => void;
  loading: boolean;
}

export function GenerateForm({ onGenerate, loading }: GenerateFormProps) {
  const [postType, setPostType] = useState<PostType>(getTodayPostType());
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<PostTone>('professional');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate(postType, topic.trim(), tone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Post Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Post Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(POST_TYPES) as [PostType, (typeof POST_TYPES)[PostType]][]).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPostType(key)}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                postType === key
                  ? 'border-linkedin bg-linkedin text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-linkedin hover:text-linkedin'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Topic / Context
          <span className="font-normal text-gray-400 ml-1">(be specific for better results)</span>
        </label>
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={POST_TYPES[postType].defaultTopic}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-linkedin focus:ring-opacity-30 focus:border-linkedin placeholder-gray-300"
          rows={3}
          required
        />
        <div className="text-right text-xs text-gray-400 mt-1">{topic.length} chars</div>
      </div>

      {/* Tone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(TONES) as [PostTone, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTone(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                tone === key
                  ? 'bg-linkedin border-linkedin text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-linkedin hover:text-linkedin'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Today's default note */}
      <div className="bg-linkedin-light rounded-lg px-3 py-2 text-xs text-linkedin">
        Today's scheduled type: <strong>{POST_TYPES[getTodayPostType()].label}</strong> — pre-selected above
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full">
        <Sparkles className="w-4 h-4" />
        {loading ? 'Generating...' : 'Generate Post'}
      </Button>
    </form>
  );
}
