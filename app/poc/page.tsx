'use client';

import { useState } from 'react';
import { Zap, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { PromptInput }        from '@/components/poc/PromptInput';
import { WorkflowJsonPreview } from '@/components/poc/WorkflowJsonPreview';
import { PushButton }          from '@/components/poc/PushButton';
import { WorkflowSteps }       from '@/components/poc/WorkflowSteps';
import { N8nConnectionSetup }  from '@/components/poc/N8nConnectionSetup';
import type { GeneratedWorkflow } from '@/types/n8n';

const SUPPORTED_NODES = [
  'Schedule Trigger', 'Webhook', 'HTTP Request',
  'Gmail', 'Slack', 'Google Sheets',
  'OpenAI', 'IF / Branch', 'Edit Fields', 'Code',
];

export default function PocPage() {
  const [prompt,      setPrompt]      = useState('');
  const [generated,   setGenerated]   = useState<GeneratedWorkflow | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [pushStatus,  setPushStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [workflowUrl, setWorkflowUrl] = useState('');
  const [activate,    setActivate]    = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setGenerated(null);
    setPushStatus('idle');
    setWorkflowUrl('');

    try {
      const res  = await fetch('/api/poc/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt }),
      });
      const data = await res.json() as GeneratedWorkflow & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed');
      setGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    if (!generated) return;
    setPushStatus('loading');

    const baseUrl = localStorage.getItem('n8n_base_url') ?? '';
    const apiKey  = localStorage.getItem('n8n_api_key')  ?? '';

    if (!baseUrl || !apiKey) {
      setError('Configure and save your n8n connection first.');
      setPushStatus('error');
      return;
    }

    try {
      const res  = await fetch('/api/poc/push', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          workflow:         generated.workflow,
          connectionConfig: { baseUrl, apiKey },
          activate,
        }),
      });
      const data = await res.json() as { workflowUrl?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Push failed');
      setWorkflowUrl(data.workflowUrl ?? '');
      setPushStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Push failed');
      setPushStatus('error');
    }
  };

  const handleReset = () => {
    setPrompt('');
    setGenerated(null);
    setError('');
    setPushStatus('idle');
    setWorkflowUrl('');
  };

  const busy = loading || pushStatus === 'loading';

  return (
    <div className="p-6 max-w-[1100px]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Automation Builder</h1>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                POC
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Describe any automation — AI generates the n8n workflow and deploys it instantly.
            </p>
          </div>
        </div>

        {generated && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Start over
          </button>
        )}
      </div>

      {/* ── Two-column layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

        {/* ── LEFT: main content ─────────────────────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* Prompt card */}
          <div className="card p-5 space-y-4">
            <PromptInput value={prompt} onChange={setPrompt} disabled={busy} />

            {error && (
              <div className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || busy}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><Zap className="w-4 h-4" /> Generate Workflow</>
                }
              </button>

              {loading && (
                <span className="text-xs text-slate-400 animate-pulse">
                  AI is building your workflow…
                </span>
              )}
            </div>
          </div>

          {/* Steps */}
          {generated && (
            <WorkflowSteps
              steps={generated.steps}
              explanation={generated.explanation}
            />
          )}

          {/* JSON preview */}
          {(loading || generated) && (
            <WorkflowJsonPreview
              json={generated ? JSON.stringify(generated.workflow, null, 2) : ''}
              loading={loading}
            />
          )}

          {/* Push section */}
          {generated && pushStatus !== 'success' && (
            <div className="card p-4 flex items-center justify-between gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activate}
                  onChange={e => setActivate(e.target.checked)}
                  className="w-4 h-4 rounded accent-linkedin cursor-pointer"
                />
                <span className="text-sm text-slate-700">Activate immediately after pushing</span>
              </label>
              <PushButton
                status={pushStatus}
                onClick={handlePush}
                workflowUrl={workflowUrl}
              />
            </div>
          )}

          {/* Success banner */}
          {pushStatus === 'success' && (
            <div className="card p-4 bg-emerald-50 border-emerald-200 flex items-center justify-between gap-4 animate-fade-in">
              <div className="text-sm text-emerald-700 font-medium">
                Workflow created in n8n{activate ? ' and activated' : ' (draft mode)'}
              </div>
              <PushButton
                status={pushStatus}
                onClick={handlePush}
                workflowUrl={workflowUrl}
              />
            </div>
          )}
        </div>

        {/* ── RIGHT: sidebar ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Connection */}
          <N8nConnectionSetup />

          {/* How it works */}
          <div className="card p-4 space-y-3">
            <p className="section-label">How it works</p>
            <ol className="space-y-2.5">
              {[
                'Describe your automation in plain English',
                'AI generates a complete, valid n8n workflow',
                'Review the steps and JSON output',
                'Push directly to your n8n instance',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Supported nodes */}
          <div className="card p-4 space-y-3">
            <p className="section-label">Supported nodes</p>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTED_NODES.map(n => (
                <span
                  key={n}
                  className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
