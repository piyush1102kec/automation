'use client';

import { useState, useRef } from 'react';
import { GenerateForm } from '@/components/generate/GenerateForm';
import { GenerateResult } from '@/components/generate/GenerateResult';
import type { PostType, PostTone } from '@/lib/post-types';
import { Sparkles } from 'lucide-react';

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [result, setResult] = useState<{ content: string; postType: PostType; topic: string; postId?: number } | null>(null);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async (postType: PostType, topic: string, tone: PostTone) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setStreaming('');
    setResult(null);
    setError('');

    let accumulated = '';
    let postId: number | undefined;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postType, topic, tone }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        setError('Generation failed. Check your API key.');
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
            } else if (event.type === 'error') {
              setError(event.error);
            }
          } catch { /* ignore parse errors */ }
        }
      }

      setResult({ content: accumulated.trim(), postType, topic, postId });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-linkedin" />
          Generate Post
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          AI-powered LinkedIn content for Bitloom, ready in seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <GenerateForm onGenerate={handleGenerate} loading={loading} />
        </div>

        {/* Right: Result */}
        <div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {loading && !result && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-linkedin rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-linkedin rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-linkedin rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-gray-500 ml-1">Researching + drafting…</span>
              </div>
              {streaming && (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-l-2 border-linkedin pl-3">
                  {streaming}
                  <span className="inline-block w-0.5 h-4 bg-linkedin ml-0.5 animate-pulse" />
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
            />
          )}

          {!loading && !result && !error && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Your generated post will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
