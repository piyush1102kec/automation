'use client';

import { useState, useEffect } from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { POST_TYPES, TONES, getTodayPostType, type PostType, type PostTone } from '@/lib/post-types';

interface CustomTone {
  id: string;
  label: string;
  instruction: string;
}

interface TopicShortcut {
  id: number;
  post_type: string;
  topic: string;
}

interface GenerateFormProps {
  onGenerate: (postType: PostType, topic: string, tone: PostTone) => void;
  loading: boolean;
}

export function GenerateForm({ onGenerate, loading }: GenerateFormProps) {
  const [postType, setPostType] = useState<PostType>(getTodayPostType());
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<PostTone>('professional');
  const [customTones, setCustomTones] = useState<CustomTone[]>([]);
  const [shortcuts, setShortcuts] = useState<TopicShortcut[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    fetch('/api/settings?resource=tones')
      .then(r => r.json())
      .then(d => setCustomTones(d.custom ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!postType) return;
    fetch(`/api/settings?resource=topics&postType=${postType}`)
      .then(r => r.json())
      .then(d => setShortcuts(d.topics ?? []))
      .catch(() => {});
  }, [postType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate(postType, topic.trim(), tone);
  };

  const todayType = getTodayPostType();

  // Merge system + custom tones
  const allTones = [
    ...(Object.entries(TONES) as [PostTone, string][]).map(([id, label]) => ({ id, label, system: true })),
    ...customTones.map(t => ({ id: t.id as PostTone, label: t.label, system: false })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Post Type */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
          Post Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(POST_TYPES) as [PostType, (typeof POST_TYPES)[PostType]][]).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPostType(key)}
              className={`px-3 py-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                postType === key
                  ? 'border-linkedin bg-linkedin text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-linkedin/40 hover:text-linkedin hover:bg-linkedin-light/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: postType === key ? 'rgba(255,255,255,0.7)' : config.color }}
                />
                {config.label}
              </div>
            </button>
          ))}
        </div>
        {postType === todayType && (
          <div className="mt-2 text-xs text-linkedin bg-linkedin-light px-3 py-1.5 rounded-lg">
            ✓ Today&apos;s scheduled type
          </div>
        )}
      </div>

      {/* Topic */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Topic / Context
          </label>
          {shortcuts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="inline-flex items-center gap-1 text-xs text-linkedin hover:underline"
            >
              <BookOpen className="w-3 h-3" />
              {showShortcuts ? 'Hide' : 'Shortcuts'}
            </button>
          )}
        </div>

        {showShortcuts && shortcuts.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {shortcuts.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setTopic(s.topic); setShowShortcuts(false); }}
                className="text-xs bg-slate-100 hover:bg-linkedin-light hover:text-linkedin text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 hover:border-linkedin/30 transition-colors"
              >
                {s.topic.length > 50 ? s.topic.slice(0, 50) + '…' : s.topic}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={POST_TYPES[postType].defaultTopic}
          className="input-base resize-none text-sm"
          rows={3}
          required
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-400">Be specific for best results</span>
          <span className="text-xs text-slate-400">{topic.length} chars</span>
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
          Tone
        </label>
        <div className="flex flex-wrap gap-2">
          {allTones.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTone(id as PostTone)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                tone === id
                  ? 'bg-linkedin border-linkedin text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-linkedin/40 hover:text-linkedin'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full !rounded-xl font-semibold">
        <Sparkles className="w-4 h-4" />
        {loading ? 'Generating…' : 'Generate Post'}
      </Button>
    </form>
  );
}
