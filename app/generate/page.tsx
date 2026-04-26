'use client';

import { useState, useRef } from 'react';
import { GenerateForm } from '@/components/generate/GenerateForm';
import { GenerateResult } from '@/components/generate/GenerateResult';
import type { PostType, PostTone } from '@/lib/post-types';
import { Sparkles, AlertCircle } from 'lucide-react';

interface GenerateMeta {
  inputTokens: number;
  outputTokens: number;
  timeMs: number;
  costUsd: number;
}

interface ResultState {
  content: string;
  postType: PostType;
  topic: string;
  postId?: number;
  meta?: GenerateMeta | null;
}

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async (postType: PostType, topic: string, tone: PostTone) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setStreaming('');
    setResult(null);
    setError('');

    let accumulated = '';
    let postId: number | undefined;
    let meta: GenerateMeta | null = null;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postType, topic, tone }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        setError('Generation failed. Check your API key and try again.');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'text') {
              accumulated += event.text;
              setStreaming(accumulated);
            } else if (event.type === 'done') {
              postId = event.postId;
              meta = event.meta ?? null;
            } else if (event.type === 'error') {
              setError(event.error);
            }
          } catch { /* ignore parse errors */ }
        }
      }

      setResult({ content: accumulated.trim(), postType, topic, postId, meta });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-linkedin" />
          <h1 className="text-xl font-bold text-slate-900">Generate Post</h1>
        </div>
        <p className="text-sm text-slate-500">
          AI-powered LinkedIn content — researches, drafts, and tracks cost automatically
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <GenerateForm onGenerate={handleGenerate} loading={loading} />
        </div>

        {/* Right: Result */}
        <div>
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading && !result && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-linkedin rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-linkedin rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-linkedin rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-500 ml-1">Researching and drafting your post…</span>
              </div>
              {streaming && (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border-l-2 border-linkedin pl-4 bg-slate-50/50 py-2 rounded-r-lg">
                  {streaming}
                  <span className="cursor-blink" />
                </div>
              )}
            </div>
          )}

          {result && !loading && (
            <GenerateResult
              content={result.content}
              postType={result.postType}
              topic={result.topic}
              postId={result.postId}
              meta={result.meta}
            />
          )}

          {!loading && !result && !error && (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-linkedin-light flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-linkedin" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Your post will appear here</p>
              <p className="text-xs text-slate-400">Token usage and cost shown after generation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
