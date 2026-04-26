'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Plus, Trash2, ToggleLeft, ToggleRight, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PLATFORMS, getPlatformPostTypes, FREQUENCY_OPTIONS, DAY_LABELS, type PlatformId } from '@/lib/platforms';

interface Schedule {
  id: number;
  platform: string;
  post_type: string;
  frequency: 'daily' | 'working_days' | 'weekends' | 'custom';
  custom_days: string;
  time: string;
  tone: string;
  default_topic: string | null;
  is_active: number;
  last_generated_at: string | null;
  created_at: string;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Every day',
  working_days: 'Mon – Fri',
  weekends: 'Sat & Sun',
  custom: 'Custom days',
};

const TONE_OPTIONS = ['professional', 'casual', 'provocative', 'storytelling'];

// Platform brand dot colors
const PLATFORM_COLORS: Record<string, string> = {
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  instagram: '#E1306C',
  facebook: '#1877F2',
  threads: '#000000',
};

function ScheduleCard({ schedule, onToggle, onDelete }: {
  schedule: Schedule;
  onToggle: (id: number, active: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const platform = PLATFORMS[schedule.platform as PlatformId];
  const postTypes = getPlatformPostTypes(schedule.platform as PlatformId);
  const postTypeLabel = postTypes.find(t => t.id === schedule.post_type)?.label ?? schedule.post_type;
  const customDays: number[] = JSON.parse(schedule.custom_days || '[]');
  const active = !!schedule.is_active;

  const daysDisplay = schedule.frequency === 'custom'
    ? customDays.map(d => DAY_LABELS[d]).join(', ') || 'No days selected'
    : FREQUENCY_LABELS[schedule.frequency];

  return (
    <div className={`bg-white rounded-xl border shadow-card p-4 transition-all ${active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Platform dot */}
          <div
            className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
            style={{ backgroundColor: PLATFORM_COLORS[schedule.platform] ?? '#64748B' }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-900">{platform?.name ?? schedule.platform}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{postTypeLabel}</span>
              <span className="text-xs text-slate-400 font-mono capitalize">{schedule.tone}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {daysDisplay}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {schedule.time}
              </span>
            </div>
            {schedule.default_topic && (
              <p className="mt-1.5 text-xs text-slate-400 truncate max-w-xs">
                Topic: {schedule.default_topic}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(schedule.id, !active)}
            className={`transition-colors ${active ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-slate-400'}`}
          >
            {active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
          </button>
          <button
            onClick={() => onDelete(schedule.id)}
            className="text-slate-300 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateScheduleModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [platform, setPlatform] = useState<PlatformId>('linkedin');
  const [postType, setPostType] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'working_days' | 'weekends' | 'custom'>('working_days');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [time, setTime] = useState('09:00');
  const [tone, setTone] = useState('professional');
  const [defaultTopic, setDefaultTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset post type when platform changes
  useEffect(() => {
    const types = getPlatformPostTypes(platform);
    setPostType(types[0]?.id ?? '');
  }, [platform]);

  const toggleDay = (day: number) => {
    setCustomDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleCreate = async () => {
    if (!postType) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          post_type: postType,
          frequency,
          custom_days: customDays,
          time,
          tone,
          default_topic: defaultTopic.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? 'Failed to create schedule');
        return;
      }
      onCreated();
      onClose();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const platformPostTypes = getPlatformPostTypes(platform);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">New Auto-Schedule</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Platform */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">Platform</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PLATFORMS) as PlatformId[]).map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlatform(id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    platform === id ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: platform === id ? 'rgba(255,255,255,0.8)' : PLATFORM_COLORS[id] }}
                  />
                  {PLATFORMS[id].name}
                </button>
              ))}
            </div>
          </div>

          {/* Post Type */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">Post Type</label>
            <select
              value={postType}
              onChange={e => setPostType(e.target.value)}
              className="input-base text-sm"
            >
              {platformPostTypes.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">Frequency</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FREQUENCY_OPTIONS) as Array<keyof typeof FREQUENCY_OPTIONS>).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    frequency === f ? 'bg-linkedin border-linkedin text-white' : 'border-slate-200 text-slate-600 hover:border-linkedin/40'
                  }`}
                >
                  {FREQUENCY_LABELS[f]}
                </button>
              ))}
            </div>

            {/* Custom day picker */}
            {frequency === 'custom' && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {DAY_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`w-9 h-9 rounded-lg border text-xs font-semibold transition-colors ${
                      customDays.includes(idx)
                        ? 'bg-linkedin border-linkedin text-white'
                        : 'border-slate-200 text-slate-600 hover:border-linkedin/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Active days preview */}
            {frequency !== 'custom' && (
              <div className="mt-2 flex flex-wrap gap-1">
                {FREQUENCY_OPTIONS[frequency].map(d => (
                  <span key={d} className="text-xs bg-linkedin/10 text-linkedin px-2 py-0.5 rounded-full font-medium">
                    {DAY_LABELS[d]}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Post Time
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="input-base text-sm w-40"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors capitalize ${
                    tone === t ? 'bg-linkedin border-linkedin text-white' : 'border-slate-200 text-slate-600 hover:border-linkedin/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Default Topic */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Default Topic <span className="text-slate-300 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={defaultTopic}
              onChange={e => setDefaultTopic(e.target.value)}
              placeholder="Leave empty to prompt when generating…"
              className="input-base text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleCreate} loading={saving}>
            <Plus className="w-3.5 h-3.5" />
            Create Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      setSchedules(data.schedules ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleSchedule = async (id: number, active: boolean) => {
    await fetch(`/api/schedule?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: active ? 1 : 0 }),
    });
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, is_active: active ? 1 : 0 } : s));
  };

  const deleteSchedule = async (id: number) => {
    if (!confirm('Delete this schedule?')) return;
    await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' });
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const filtered = filterPlatform === 'all' ? schedules : schedules.filter(s => s.platform === filterPlatform);
  const activeCount = schedules.filter(s => s.is_active).length;

  return (
    <div className="p-6 max-w-[1000px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-linkedin" />
            <h1 className="text-xl font-bold text-slate-900">Auto-Schedule</h1>
          </div>
          <p className="text-sm text-slate-500">
            Configure recurring post schedules across all platforms — daily, weekdays, weekends, or custom days.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          New Schedule
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
          <div className="text-2xl font-bold text-slate-900">{schedules.length}</div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Total schedules</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
          <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Active</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
          <div className="text-2xl font-bold text-slate-900">
            {new Set(schedules.map(s => s.platform)).size}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Platforms configured</div>
        </div>
      </div>

      {/* Platform filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilterPlatform('all')}
          className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
            filterPlatform === 'all' ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'
          }`}
        >
          All platforms
        </button>
        {(Object.keys(PLATFORMS) as PlatformId[]).map(id => (
          <button
            key={id}
            onClick={() => setFilterPlatform(id)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterPlatform === id ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: filterPlatform === id ? 'rgba(255,255,255,0.8)' : PLATFORM_COLORS[id] }}
            />
            {PLATFORMS[id].name}
          </button>
        ))}
      </div>

      {/* Schedule list */}
      {loading ? (
        <div className="text-sm text-slate-400 text-center py-12">Loading schedules…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600 mb-1">No schedules yet</p>
          <p className="text-xs text-slate-400 mb-4">Create a schedule to automate content generation across platforms</p>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-3.5 h-3.5" />
            Create first schedule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(schedule => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onToggle={toggleSchedule}
              onDelete={deleteSchedule}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateScheduleModal
          onClose={() => setShowModal(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}
