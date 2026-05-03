'use client';

import { useState, useEffect } from 'react';
import { Settings2, Eye, EyeOff, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Wifi } from 'lucide-react';

export function N8nConnectionSetup() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [baseUrl,     setBaseUrl]     = useState('');
  const [apiKey,      setApiKey]      = useState('');
  const [showKey,     setShowKey]     = useState(false);
  const [testStatus,  setTestStatus]  = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [testMsg,     setTestMsg]     = useState('');
  const [ollamaMsg,   setOllamaMsg]   = useState('');
  const [ollamaOk,    setOllamaOk]    = useState<boolean | null>(null);
  const [saved,       setSaved]       = useState(false);

  useEffect(() => {
    const url = localStorage.getItem('n8n_base_url') ?? '';
    const key = localStorage.getItem('n8n_api_key')  ?? '';
    setBaseUrl(url);
    setApiKey(key);
    if (!url || !key) setIsOpen(true);
  }, []);

  const isConfigured = !!(
    localStorage.getItem?.('n8n_base_url') &&
    localStorage.getItem?.('n8n_api_key')
  );

  const handleTest = async () => {
    if (!baseUrl || !apiKey) return;
    setTestStatus('testing');
    setTestMsg('');
    try {
      const res  = await fetch('/api/poc/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, apiKey }),
      });
      const data = await res.json() as {
        connected: boolean;
        workflowCount?: number;
        error?: string;
        ollama?: { ok: boolean; model: string; error?: string };
      };
      if (data.connected) {
        setTestStatus('ok');
        setTestMsg(`${data.workflowCount ?? 0} workflows found`);
        if (data.ollama) {
          setOllamaOk(data.ollama.ok);
          setOllamaMsg(data.ollama.ok ? data.ollama.model : (data.ollama.error ?? 'Ollama error'));
        }
      } else {
        setTestStatus('error');
        setTestMsg(data.error ?? 'Connection failed');
      }
    } catch {
      setTestStatus('error');
      setTestMsg('Network error — is n8n running?');
    }
  };

  const handleSave = () => {
    localStorage.setItem('n8n_base_url', baseUrl.trim());
    localStorage.setItem('n8n_api_key',  apiKey.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); setIsOpen(false); }, 1200);
  };

  return (
    <div className="card overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <Wifi className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-sm font-semibold text-slate-800">n8n Connection</span>

          {testStatus === 'ok' && !isOpen && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected · {testMsg}
            </span>
          )}
          {isConfigured && testStatus === 'idle' && !isOpen && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Configured</span>
          )}
        </div>
        {isOpen
          ? <ChevronUp  className="w-4 h-4 text-slate-400" />
          : <ChevronDown className="w-4 h-4 text-slate-400" />
        }
      </button>

      {/* Form */}
      {isOpen && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-4 animate-fade-in">
          {/* Base URL */}
          <div className="space-y-1.5">
            <label className="section-label">Instance URL</label>
            <input
              type="url"
              value={baseUrl}
              onChange={e => { setBaseUrl(e.target.value); setTestStatus('idle'); }}
              placeholder="http://localhost:5678"
              className="input-base"
            />
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label className="section-label">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setTestStatus('idle'); }}
                placeholder="n8n_api_..."
                className="input-base pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400">Settings → API → Create API key in your n8n instance</p>
          </div>

          {/* Status feedback */}
          {testStatus === 'ok' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                n8n connected — {testMsg}
              </div>
              {ollamaOk === true && (
                <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Ollama ready — <span className="font-mono font-semibold">{ollamaMsg}</span>
                </div>
              )}
              {ollamaOk === false && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  Ollama: {ollamaMsg}
                </div>
              )}
            </div>
          )}
          {testStatus === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              {testMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTest}
              disabled={!baseUrl || !apiKey || testStatus === 'testing'}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
            >
              {testStatus === 'testing'
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Testing…</>
                : 'Test connection'
              }
            </button>
            <button
              onClick={handleSave}
              disabled={!baseUrl || !apiKey}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
            >
              {saved ? <><CheckCircle2 className="w-3 h-3" /> Saved!</> : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
