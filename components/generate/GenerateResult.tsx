'use client';

import { useState } from 'react';
import { CheckCircle, Save, ExternalLink, Cpu, DollarSign, Clock, Zap } from 'lucide-react';
import { CopyButton } from '@/components/ui/CopyButton';
import { Button } from '@/components/ui/Button';
import { TypeBadge } from '@/components/ui/Badge';
import type { PostType } from '@/lib/post-types';
import { formatCostUsd, formatTokens, formatDuration } from '@/lib/cost-calculator';

interface GenerateMeta {
  inputTokens: number;
  outputTokens: number;
  timeMs: number;
  costUsd: number;
}

interface GenerateResultProps {
  content: string;
  postType: PostType;
  topic: string;
  postId?: number;
  meta?: GenerateMeta | null;
  onSave?: () => void;
}

export function GenerateResult({ content, postType, topic, postId, meta, onSave }: GenerateResultProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!postId);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const savePost = async () => {
    if (saved) return;
    setSaving(true);
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent, postType, topic, status: 'draft', source: 'manual' }),
      });
      setSaved(true);
      onSave?.();
    } finally {
      setSaving(false);
    }
  };

  const markPosted = async () => {
    if (!postId) return;
    setMarking(true);
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'posted', posted_at: new Date().toISOString() }),
      });
      setMarked(true);
    } finally {
      setMarking(false);
    }
  };

  const wordCount = editContent.split(/\s+/).filter(Boolean).length;
  const charCount = editContent.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden animate-slide-up">
      {/* Usage metrics bar */}
      {meta && (
        <div className="flex items-center gap-4 px-4 py-2.5 bg-slate-900 text-slate-400 text-xs border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formatDuration(meta.timeMs)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-slate-500" />
            <span>{formatTokens(meta.inputTokens + meta.outputTokens)} tokens</span>
            <span className="text-slate-600">({formatTokens(meta.inputTokens)}↑ {formatTokens(meta.outputTokens)}↓)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 text-slate-500" />
            <span className="text-amber-400 font-semibold">{formatCostUsd(meta.costUsd)}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500 text-[10px] font-medium">claude-sonnet-4-5</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2 min-w-0">
          <TypeBadge type={postType} />
          <span className="text-xs text-slate-500 truncate max-w-xs">{topic}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <CopyButton text={editContent} />
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-xs text-linkedin hover:underline font-medium"
          >
            {editMode ? 'Preview' : 'Edit'}
          </button>
        </div>
      </div>

      {/* LinkedIn post preview */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-linkedin to-sky-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            B
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Bitloom</div>
            <div className="text-xs text-slate-400">AI + CRM Automation · Just now</div>
          </div>
        </div>

        {editMode ? (
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full text-sm text-slate-800 leading-relaxed border border-linkedin rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-linkedin/20 min-h-[200px]"
            rows={10}
          />
        ) : (
          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {editContent}
          </div>
        )}
      </div>

      {/* Word / char count */}
      <div className="px-4 pb-2 flex items-center gap-3 text-xs text-slate-400">
        <span>{wordCount} words</span>
        <span>·</span>
        <span>{charCount} chars</span>
        {charCount > 3000 && (
          <span className="text-amber-500">⚠ LinkedIn limit is ~3,000 chars</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 flex-wrap">
        {!saved ? (
          <Button size="sm" onClick={savePost} loading={saving}>
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle className="w-4 h-4" />
            Saved to library
          </span>
        )}

        {postId && !marked && (
          <Button size="sm" variant="ghost" onClick={markPosted} loading={marking} className="text-emerald-600 hover:bg-emerald-50">
            <CheckCircle className="w-3.5 h-3.5" />
            Mark Published
          </Button>
        )}

        <a
          href="https://www.linkedin.com/feed/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-linkedin hover:underline font-medium"
        >
          Open LinkedIn
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
