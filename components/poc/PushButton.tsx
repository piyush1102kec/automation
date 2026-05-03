'use client';

import { ExternalLink, Loader2, CheckCircle2, XCircle, Rocket } from 'lucide-react';

interface PushButtonProps {
  onPush: () => void;
  status: 'idle' | 'pushing' | 'success' | 'error';
  workflowUrl?: string;
  errorMsg?: string;
}

export function PushButton({ onPush, status, workflowUrl, errorMsg }: PushButtonProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onPush}
        disabled={status === 'pushing' || status === 'success'}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {status === 'pushing' && <><Loader2 className="w-4 h-4 animate-spin" /> Deploying…</>}
        {status === 'success' && <><CheckCircle2 className="w-4 h-4" /> Deployed!</>}
        {status === 'error'   && <><XCircle className="w-4 h-4" /> Retry Deploy</>}
        {status === 'idle'    && <><Rocket className="w-4 h-4" /> Deploy to n8n</>}
      </button>

      {status === 'success' && workflowUrl && (
        <a
          href={workflowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 hover:underline"
        >
          Open in n8n <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {status === 'error' && errorMsg && (
        <p className="text-xs text-red-600 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
