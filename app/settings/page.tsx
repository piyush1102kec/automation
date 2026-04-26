'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  FileText, Mic2, Tag, Info, Check,
} from 'lucide-react';
import { POST_TYPES, TONES, type PostType, type PostTone } from '@/lib/post-types';

type Tab = 'post-types' | 'tones' | 'topics';

interface CustomPostType {
  id: string;
  label: string;
  color: string;
  bg_color: string;
  text_color: string;
  days: string;
  default_topic: string | null;
  system_prompt: string;
  content_guidance: string;
  is_active: number;
  created_at: string;
}

interface PostTypeOverride {
  post_type_key: string;
  default_topic: string | null;
  system_prompt: string | null;
  content_guidance: string | null;
}

interface CustomTone {
  id: string;
  label: string;
  instruction: string;
  is_active: number;
  created_at: string;
}

interface TopicShortcut {
  id: number;
  post_type: string;
  topic: string;
  created_at: string;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function OverrideEditor({
  ptKey, initial, onSave,
}: {
  ptKey: string;
  initial: PostTypeOverride | null;
  onSave: () => void;
}) {
  const systemPt = POST_TYPES[ptKey as PostType];
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    default_topic: initial?.default_topic ?? systemPt.defaultTopic,
    system_prompt: initial?.system_prompt ?? systemPt.systemPrompt,
    content_guidance: initial?.content_guidance ?? systemPt.contentGuidance,
  });

  const save = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'post-types',
        action: 'override',
        post_type_key: ptKey,
        ...form,
      }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: systemPt.color }}
          />
          <span className="text-sm font-semibold text-slate-800">{systemPt.label}</span>
          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">System</span>
          {initial && (
            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Modified</span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3 bg-slate-50/50 border-t border-slate-100 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Default Topic</label>
            <input
              value={form.default_topic}
              onChange={e => setForm(f => ({ ...f, default_topic: e.target.value }))}
              className="input-base text-xs"
              placeholder="Default topic for this post type"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">System Prompt</label>
            <textarea
              value={form.system_prompt}
              onChange={e => setForm(f => ({ ...f, system_prompt: e.target.value }))}
              className="input-base text-xs resize-none"
              rows={4}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Content Guidance</label>
            <textarea
              value={form.content_guidance}
              onChange={e => setForm(f => ({ ...f, content_guidance: e.target.value }))}
              className="input-base text-xs resize-none"
              rows={3}
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-linkedin text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-linkedin-hover transition-colors disabled:opacity-50"
          >
            {saving ? <span className="animate-spin">⟳</span> : <Save className="w-3.5 h-3.5" />}
            Save Override
          </button>
        </div>
      )}
    </div>
  );
}

function CustomPostTypeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<CustomPostType>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: initial?.label ?? '',
    color: initial?.color ?? '#6366F1',
    default_topic: initial?.default_topic ?? '',
    system_prompt: initial?.system_prompt ?? '',
    content_guidance: initial?.content_guidance ?? '',
    days: initial?.days ?? '[]',
  });

  const save = async () => {
    if (!form.label.trim()) return;
    setSaving(true);
    const id = initial?.id ?? slugify(form.label);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'post-types',
        id,
        ...form,
        bg_color: 'bg-indigo-100',
        text_color: 'text-indigo-700',
      }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-800">{initial?.id ? 'Edit Post Type' : 'New Post Type'}</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Label *</label>
          <input
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            className="input-base text-sm"
            placeholder="e.g. Case Study"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Color</label>
          <input
            type="color"
            value={form.color}
            onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
            className="w-full h-10 border border-slate-200 rounded-lg cursor-pointer bg-white"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">Default Topic</label>
        <input
          value={form.default_topic}
          onChange={e => setForm(f => ({ ...f, default_topic: e.target.value }))}
          className="input-base text-sm"
          placeholder="Default topic placeholder"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">System Prompt (AI persona)</label>
        <textarea
          value={form.system_prompt}
          onChange={e => setForm(f => ({ ...f, system_prompt: e.target.value }))}
          className="input-base text-xs resize-none"
          rows={4}
          placeholder="You are a LinkedIn content writer for Bitloom..."
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">Content Guidance</label>
        <textarea
          value={form.content_guidance}
          onChange={e => setForm(f => ({ ...f, content_guidance: e.target.value }))}
          className="input-base text-xs resize-none"
          rows={3}
          placeholder="Write a post about... Include... End with..."
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving || !form.label.trim()}
          className="inline-flex items-center gap-2 bg-linkedin text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-linkedin-hover transition-colors disabled:opacity-50"
        >
          {saving ? <span>Saving…</span> : <><Check className="w-3.5 h-3.5" /> Save Post Type</>}
        </button>
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-700 px-3">Cancel</button>
      </div>
    </div>
  );
}

function ToneManager({ customTones, onRefresh }: { customTones: CustomTone[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', instruction: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.label.trim() || !form.instruction.trim()) return;
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'tones', id: slugify(form.label), ...form }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ label: '', instruction: '' });
    onRefresh();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this tone?')) return;
    await fetch(`/api/settings?resource=tones&id=${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* System tones */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">System Tones</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(TONES) as [PostTone, string][]).map(([key, label]) => (
            <div key={key} className="bg-white rounded-lg border border-slate-200 p-3.5">
              <div className="text-sm font-semibold text-slate-800 mb-1">{label}</div>
              <div className="text-xs text-slate-400 capitalize">{key}</div>
              <span className="inline-block mt-2 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Built-in</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom tones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Custom Tones</h3>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-linkedin hover:text-linkedin-hover"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tone
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">New Tone</h4>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tone Name *</label>
              <input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                className="input-base text-sm"
                placeholder="e.g. Urgency-Driven"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Instruction for AI *</label>
              <textarea
                value={form.instruction}
                onChange={e => setForm(f => ({ ...f, instruction: e.target.value }))}
                className="input-base text-xs resize-none"
                rows={3}
                placeholder="Tone: Create urgency and drive immediate action. Focus on consequences of inaction..."
              />
            </div>
            <button
              onClick={save}
              disabled={saving || !form.label.trim() || !form.instruction.trim()}
              className="inline-flex items-center gap-2 bg-linkedin text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-linkedin-hover transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : <><Check className="w-3.5 h-3.5" /> Save Tone</>}
            </button>
          </div>
        )}

        {customTones.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
            <Mic2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No custom tones yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {customTones.map(tone => (
              <div key={tone.id} className="bg-white rounded-lg border border-slate-200 p-3.5 group">
                <div className="flex items-start justify-between">
                  <div className="text-sm font-semibold text-slate-800 mb-1">{tone.label}</div>
                  <button
                    onClick={() => del(tone.id)}
                    className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{tone.instruction}</p>
                <span className="inline-block mt-2 text-[10px] text-linkedin bg-linkedin-light px-1.5 py-0.5 rounded">Custom</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TopicManager({ topics, onRefresh }: { topics: TopicShortcut[]; onRefresh: () => void }) {
  const [selectedType, setSelectedType] = useState<PostType | ''>('');
  const [newTopic, setNewTopic] = useState('');
  const [saving, setSaving] = useState(false);

  const addTopic = async () => {
    if (!newTopic.trim() || !selectedType) return;
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'topics', post_type: selectedType, topic: newTopic.trim() }),
    });
    setSaving(false);
    setNewTopic('');
    onRefresh();
  };

  const del = async (id: number) => {
    await fetch(`/api/settings?resource=topics&id=${id}`, { method: 'DELETE' });
    onRefresh();
  };

  const grouped = topics.reduce((acc, t) => {
    if (!acc[t.post_type]) acc[t.post_type] = [];
    acc[t.post_type].push(t);
    return acc;
  }, {} as Record<string, TopicShortcut[]>);

  return (
    <div className="space-y-5">
      {/* Add topic form */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Save Topic Shortcut</h3>
        <div className="flex gap-3">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as PostType | '')}
            className="input-base text-sm flex-shrink-0 w-48"
          >
            <option value="">Select post type</option>
            {Object.entries(POST_TYPES).map(([key, c]) => (
              <option key={key} value={key}>{c.label}</option>
            ))}
          </select>
          <input
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTopic()}
            className="input-base text-sm flex-1"
            placeholder="Topic text..."
          />
          <button
            onClick={addTopic}
            disabled={saving || !newTopic.trim() || !selectedType}
            className="inline-flex items-center gap-2 bg-linkedin text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-linkedin-hover transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Topic list grouped by post type */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
          <Tag className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No saved topics yet</p>
          <p className="text-xs text-slate-300 mt-0.5">Add shortcuts for topics you use frequently</p>
        </div>
      ) : (
        Object.entries(grouped).map(([ptKey, ptTopics]) => {
          const config = POST_TYPES[ptKey as PostType];
          return (
            <div key={ptKey} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: config?.color ?? '#6366F1' }}
                />
                <span className="text-sm font-semibold text-slate-800">{config?.label ?? ptKey}</span>
                <span className="text-xs text-slate-400">{ptTopics.length} topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ptTopics.map(t => (
                  <div
                    key={t.id}
                    className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-600 group"
                  >
                    <span>{t.topic}</span>
                    <button
                      onClick={() => del(t.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('post-types');
  const [customPostTypes, setCustomPostTypes] = useState<CustomPostType[]>([]);
  const [overrides, setOverrides] = useState<PostTypeOverride[]>([]);
  const [customTones, setCustomTones] = useState<CustomTone[]>([]);
  const [topics, setTopics] = useState<TopicShortcut[]>([]);
  const [showNewPTForm, setShowNewPTForm] = useState(false);

  const loadSettings = useCallback(async () => {
    const [ptRes, toneRes, topicRes] = await Promise.all([
      fetch('/api/settings?resource=post-types').then(r => r.json()),
      fetch('/api/settings?resource=tones').then(r => r.json()),
      fetch('/api/settings?resource=topics').then(r => r.json()),
    ]);
    setCustomPostTypes(ptRes.custom ?? []);
    setOverrides(ptRes.overrides ?? []);
    setCustomTones(toneRes.custom ?? []);
    setTopics(topicRes.topics ?? []);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const deleteCustomPT = async (id: string) => {
    if (!confirm(`Delete post type "${id}"?`)) return;
    await fetch(`/api/settings?resource=post-types&id=${id}`, { method: 'DELETE' });
    loadSettings();
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'post-types', label: 'Post Types', icon: FileText },
    { id: 'tones', label: 'Tones', icon: Mic2 },
    { id: 'topics', label: 'Topic Shortcuts', icon: Tag },
  ];

  return (
    <div className="p-6 max-w-[1100px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-linkedin" />
          <h1 className="text-xl font-bold text-slate-900">Configuration</h1>
        </div>
        <p className="text-sm text-slate-500">Manage post types, tones, and topic shortcuts used during generation</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-linkedin-light border border-linkedin/20 rounded-xl p-4 mb-6">
        <Info className="w-4 h-4 text-linkedin flex-shrink-0 mt-0.5" />
        <p className="text-xs text-linkedin leading-relaxed">
          System post types (Thought Leadership, Creatio Insight, etc.) cannot be deleted but can be overridden with custom prompts.
          Custom post types are fully editable and will appear in the Generate Post form.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Post Types Tab */}
      {activeTab === 'post-types' && (
        <div className="space-y-5">
          {/* System post type overrides */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">System Post Types</h2>
            <p className="text-xs text-slate-400 mb-4">Override prompts and default topics for built-in post types</p>
            <div className="space-y-2">
              {Object.entries(POST_TYPES).map(([key]) => (
                <OverrideEditor
                  key={key}
                  ptKey={key}
                  initial={overrides.find(o => o.post_type_key === key) ?? null}
                  onSave={loadSettings}
                />
              ))}
            </div>
          </div>

          {/* Custom post types */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Custom Post Types</h2>
                <p className="text-xs text-slate-400 mt-0.5">Create your own post formats for Bitloom</p>
              </div>
              {!showNewPTForm && (
                <button
                  onClick={() => setShowNewPTForm(true)}
                  className="inline-flex items-center gap-2 bg-linkedin text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-linkedin-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Post Type
                </button>
              )}
            </div>

            {showNewPTForm && (
              <div className="mb-4">
                <CustomPostTypeForm
                  onSave={() => { setShowNewPTForm(false); loadSettings(); }}
                  onCancel={() => setShowNewPTForm(false)}
                />
              </div>
            )}

            {customPostTypes.length === 0 && !showNewPTForm ? (
              <div className="text-center py-8 border border-dashed border-slate-300 rounded-xl">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No custom post types yet</p>
                <button
                  onClick={() => setShowNewPTForm(true)}
                  className="text-xs text-linkedin hover:underline mt-1"
                >
                  Create your first one
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {customPostTypes.map(pt => (
                  <div
                    key={pt.id}
                    className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pt.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800">{pt.label}</div>
                      <div className="text-xs text-slate-400 truncate">{pt.content_guidance || 'No guidance set'}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Custom</span>
                    <button
                      onClick={() => deleteCustomPT(pt.id)}
                      className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tones Tab */}
      {activeTab === 'tones' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Tone Management</h2>
          <p className="text-xs text-slate-400 mb-5">Custom tones appear in the Generate Post form alongside system tones</p>
          <ToneManager customTones={customTones} onRefresh={loadSettings} />
        </div>
      )}

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Topic Shortcuts</h2>
          <p className="text-xs text-slate-400 mb-5">Save frequently used topics as shortcuts for faster content generation</p>
          <TopicManager topics={topics} onRefresh={loadSettings} />
        </div>
      )}
    </div>
  );
}
