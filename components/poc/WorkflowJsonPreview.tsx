'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface WorkflowJsonPreviewProps {
  json: string;
  loading?: boolean;
}

export function WorkflowJsonPreview({ json, loading }: WorkflowJsonPreviewProps) {
  const [copied,    setCopied]    = useState(false);
  const [expanded,  setExpanded]  = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="card overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">Workflow JSON</span>
          <div className="w-16 h-5 shimmer rounded" />
        </div>
        <div className="bg-slate-900 p-4 space-y-2.5">
          {[92, 78, 100, 65, 84, 58].map((w, i) => (
            <div
              key={i}
              className="h-2.5 rounded-sm bg-slate-700 animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!json) return null;

  return (
    <div className="card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          {expanded
            ? <ChevronUp  className="w-3.5 h-3.5 text-slate-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          }
          Workflow JSON
          <span className="text-xs font-normal text-slate-400 ml-1">
            {expanded ? 'collapse' : 'expand'}
          </span>
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          {copied
            ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</>
            : <><Copy className="w-3 h-3" /> Copy JSON</>
          }
        </button>
      </div>

      {/* Code */}
      <pre
        className={`overflow-auto text-xs text-green-400 bg-slate-900 leading-relaxed font-mono transition-all duration-300 ${
          expanded ? 'max-h-[600px] p-4' : 'max-h-40 p-4'
        }`}
      >
        {json}
      </pre>
    </div>
  );
}
