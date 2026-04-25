'use client';

import { useState } from 'react';
import { CheckCircle, Save, ExternalLink } from 'lucide-react';
import { CopyButton } from '@/components/ui/CopyButton';
import { Button } from '@/components/ui/Button';
import { TypeBadge } from '@/components/ui/Badge';
import type { PostType } from '@/lib/post-types';

interface GenerateResultProps {
  content: string;
  postType: PostType;
  topic: string;
  postId?: number;
  onSave?: () => void;
}

export function GenerateResult({ content, postType, topic, postId, onSave }: GenerateResultProps) {
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <TypeBadge type={postType} />
          <span className="text-xs text-gray-500 truncate max-w-xs">{topic}</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={editContent} />
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-xs text-linkedin hover:underline"
          >
            {editMode ? 'Preview' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Post preview (LinkedIn-style) */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-linkedin flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            B
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Bitloom</div>
            <div className="text-xs text-gray-500">AI + CRM Automation · Just now</div>
          </div>
        </div>

        {editMode ? (
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full text-sm text-gray-800 leading-relaxed border border-linkedin rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-linkedin focus:ring-opacity-20"
            rows={10}
          />
        ) : (
          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {editContent}
          </div>
        )}
      </div>

      {/* Word count */}
      <div className="px-4 pb-2 text-xs text-gray-400">
        {editContent.split(/\s+/).filter(Boolean).length} words · {editContent.length} characters
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
        {!saved ? (
          <Button size="sm" onClick={savePost} loading={saving}>
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <CheckCircle className="w-4 h-4" />
            Saved to drafts
          </span>
        )}

        {postId && !marked && (
          <Button size="sm" variant="ghost" onClick={markPosted} loading={marking} className="text-green-600 hover:bg-green-50">
            <CheckCircle className="w-3.5 h-3.5" />
            Mark as Posted
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
