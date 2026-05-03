'use client';

import { useState } from 'react';
import { N8nConnectionSetup } from '@/components/poc/N8nConnectionSetup';
import { PromptInput }        from '@/components/poc/PromptInput';
import { WorkflowSteps }      from '@/components/poc/WorkflowSteps';
import { WorkflowJsonPreview } from '@/components/poc/WorkflowJsonPreview';
import { PushButton }          from '@/components/poc/PushButton';
import type { GeneratedWorkflow } from '@/types/n8n';

function getStoredConnection() {
  try {
    const baseUrl = localStorage.getItem('n8n_base_url') ?? '';
    const apiKey  = localStorage.getItem('n8n_api_key')  ?? '';
    return baseUrl && apiKey ? { baseUrl, apiKey } : null;
  } catch {
    return null;
  }
}

export default function AutomationBuilderPage() {
  const [prompt,      setPrompt]      = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated,   setGenerated]   = useState<GeneratedWorkflow | null>(null);
  const [genError,    setGenError]    = useState('');
  const [pushStatus,  setPushStatus]  = useState<'idle' | 'pushing' | 'success' | 'error'>('idle');
  const [workflowUrl, setWorkflowUrl] = useState('');
  const [pushError,   setPushError]   = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGenerated(null);
    setGenError('');
    setPushStatus('idle');

    try {
      const res  = await fetch('/api/poc/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json() as GeneratedWorkflow & { error?: string };
      if (data.error) throw new Error(data.error);
      setGenerated(data);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePush = async () => {
    if (!generated) return;
    const conn = getStoredConnection();
    if (!conn) {
      setPushError('Configure your n8n connection first.');
      setPushStatus('error');
      return;
    }

    setPushStatus('pushing');
    setPushError('');

    try {
      const res  = await fetch('/api/poc/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: generated.workflow, connectionConfig: conn }),
      });
      const data = await res.json() as { workflowId?: string; workflowUrl?: string; error?: string };
      if (data.error) throw new Error(data.error);
      setWorkflowUrl(data.workflowUrl ?? '');
      setPushStatus('success');
    } catch (err) {
      setPushError(err instanceof Error ? err.message : 'Deploy failed');
      setPushStatus('error');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Automation Builder</h1>
        <p className="text-sm text-slate-500 mt-1">
          Describe any automation in plain English — AI generates and deploys the n8n workflow instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          <N8nConnectionSetup />
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {genError && (
            <div className="card px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-200">
              {genError}
            </div>
          )}

          {generated && (
            <>
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Generated Workflow</h2>
                <WorkflowSteps steps={generated.steps} explanation={generated.explanation} />
              </div>

              <WorkflowJsonPreview workflow={generated.workflow} />

              <div className="card p-4">
                <PushButton
                  onPush={handlePush}
                  status={pushStatus}
                  workflowUrl={workflowUrl}
                  errorMsg={pushError}
                />
              </div>
            </>
          )}

          {!generated && !genError && !isGenerating && (
            <div className="card p-8 flex flex-col items-center justify-center text-center text-slate-400 border-dashed">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-sm font-medium">Your workflow will appear here</p>
              <p className="text-xs mt-1">Enter a prompt and click Generate Workflow</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
