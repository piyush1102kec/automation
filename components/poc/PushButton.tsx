'use client';

import { Loader2, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface PushButtonProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  onClick: () => void;
  workflowUrl?: string;
}

export function PushButton({ status, onClick, workflowUrl }: PushButtonProps) {
  if (status === 'success' && workflowUrl) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Pushed to n8n
        </div>
        <a
          href={workflowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
        >
          Open in n8n <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-lg transition-colors"
      >
        <AlertCircle className="w-4 h-4" />
        Failed — retry
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={status === 'loading'}
      className="flex items-center gap-2 text-sm font-semibold text-white bg-linkedin hover:bg-linkedin-hover px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      {status === 'loading'
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Pushing to n8n…</>
        : <><Send className="w-4 h-4" /> Push to n8n</>
      }
    </button>
  );
}
