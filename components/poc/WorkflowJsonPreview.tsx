'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import type { N8nWorkflow } from '@/types/n8n';

interface WorkflowJsonPreviewProps {
  workflow: N8nWorkflow;
}

export function WorkflowJsonPreview({ workflow }: WorkflowJsonPreviewProps) {
  const [isOpen,  setIsOpen]  = useState(false);
  const [copied,  setCopied]  = useState(false);

  const json = JSON.stringify(workflow, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <span className="text-xs font-semibold text-slate-600 font-mono">workflow.json</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{workflow.nodes.length} nodes</span>
          {isOpen
            ? <ChevronUp   className="w-3.5 h-3.5 text-slate-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          }
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100">
          <div className="flex justify-end px-3 py-2 border-b border-slate-100">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              {copied
                ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                : <><Copy className="w-3.5 h-3.5" /> Copy JSON</>
              }
            </button>
          </div>
          <pre className="text-xs text-slate-700 p-4 overflow-x-auto max-h-[600px] overflow-y-auto bg-slate-50 font-mono leading-relaxed">
            {json}
          </pre>
        </div>
      )}
    </div>
  );
}
