'use client';

import { useState, useEffect } from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TONES, type PostTone } from '@/lib/post-types';
import { PLATFORMS, getPlatformPostTypes, type PlatformId } from '@/lib/platforms';

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
  onGenerate: (postType: string, topic: string, tone: string, platform: PlatformId) => void;
  loading: boolean;
}

// Platform brand colors for the selector
const PLATFORM_STYLES: Record<PlatformId, { active: string; dot: string }> = {
  linkedin: { active: 'border-[#0A66C2] bg-[#0A66C2] text-white', dot: '#0A66C2' },
  twitter: { active: 'border-[#1DA1F2] bg-[#1DA1F2] text-white', dot: '#1DA1F2' },
  instagram: { active: 'border-[#E1306C] bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white', dot: '#E1306C' },
  facebook: { active: 'border-[#1877F2] bg-[#1877F2] text-white', dot: '#1877F2' },
  threads: { active: 'border-slate-900 bg-slate-900 text-white', dot: '#000000' },
};

export function GenerateForm({ onGenerate, loading }: GenerateFormProps) {
  const [platform, setPlatform] = useState<PlatformId>('linkedin');
  const [postType, setPostType] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<string>('professional');
  const [customTones, setCustomTones] = useState<CustomTone[]>([]);
  const [shortcuts, setShortcuts] = useState<TopicShortcut[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // When platform changes, reset post type to first type of new platform
  useEffect(() => {
    const types = getPlatformPostTypes(platform);
    setPostType(types[0]?.id ?? '');
  }, [platform]);

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
    if (!topic.trim() || !postType) return;
    onGenerate(postType, topic.trim(), tone, platform);
  };

  const platformPostTypes = getPlatformPostTypes(platform);
  const platformConfig = PLATFORMS[platform];

  // Merge system + custom tones
  const allTones = [
    ...(Object.entries(TONES) as [PostTone, string][]).map(([id, label]) => ({ id, label })),
    ...customTones.map(t => ({ id: t.id, label: t.label })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Platform Selector */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
          Platform
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(PLATFORMS) as [PlatformId, typeof PLATFORMS[PlatformId]][]).map(([id, config]) => {
            const styles = PLATFORM_STYLES[id];
            const active = platform === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPlatform(id)}
                className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                  active ? styles.active + ' shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: active ? 'rgba(255,255,255,0.8)' : styles.dot }}
                />
                {config.name}
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          Limit: <span className="font-medium text-slate-600">{platformConfig.maxChars.toLocaleString()} chars</span>
          {platformConfig.hashtagRange && (
            <span className="ml-2">· Hashtags: <span className="font-medium text-slate-600">{platformConfig.hashtagRange[0]}–{platformConfig.hashtagRange[1]}</span></span>
          )}
        </div>
      </div>

      {/* Post Type */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
          Post Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {platformPostTypes.map((config) => (
            <button
              key={config.id}
              type="button"
              onClick={() => setPostType(config.id)}
              className={`px-3 py-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                postType === config.id
                  ? 'border-linkedin bg-linkedin text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-linkedin/40 hover:text-linkedin hover:bg-blue-50/40'
              }`}
            >
              <div className="font-semibold">{config.label}</div>
              <div className={`text-[10px] mt-0.5 ${postType === config.id ? 'text-white/70' : 'text-slate-400'}`}>
                {config.idealChars ? `~${config.idealChars} chars` : `≤${PLATFORMS[platform].maxChars} chars`}
              </div>
            </button>
          ))}
        </div>
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
                className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-linkedin text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 hover:border-linkedin/30 transition-colors"
              >
                {s.topic.length > 50 ? s.topic.slice(0, 50) + '…' : s.topic}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={platformPostTypes.find(t => t.id === postType)?.defaultTopic ?? 'Describe your topic…'}
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
              onClick={() => setTone(id)}
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
        {loading ? 'Generating…' : `Generate ${PLATFORMS[platform].name} Post`}
      </Button>
    </form>
  );
}
