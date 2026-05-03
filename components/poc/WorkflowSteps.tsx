'use client';

import type { WorkflowStep } from '@/types/n8n';
import {
  Clock, Webhook, Globe, Mail, MessageSquare,
  Sheet, Brain, GitBranch, Shuffle, Code2,
} from 'lucide-react';

interface WorkflowStepsProps {
  steps: WorkflowStep[];
  explanation: string;
}

function nodeIcon(type: string) {
  const base = type.replace('n8n-nodes-base.', '');
  const map: Record<string, React.ReactNode> = {
    scheduleTrigger: <Clock className="w-4 h-4" />,
    webhook:         <Webhook className="w-4 h-4" />,
    httpRequest:     <Globe className="w-4 h-4" />,
    gmail:           <Mail className="w-4 h-4" />,
    slack:           <MessageSquare className="w-4 h-4" />,
    googleSheets:    <Sheet className="w-4 h-4" />,
    openAi:          <Brain className="w-4 h-4" />,
    if:              <GitBranch className="w-4 h-4" />,
    set:             <Shuffle className="w-4 h-4" />,
    code:            <Code2 className="w-4 h-4" />,
  };
  return map[base] ?? <Code2 className="w-4 h-4" />;
}

function nodeColor(type: string) {
  const base = type.replace('n8n-nodes-base.', '');
  const map: Record<string, string> = {
    scheduleTrigger: 'bg-violet-100 text-violet-600',
    webhook:         'bg-orange-100 text-orange-600',
    httpRequest:     'bg-blue-100 text-blue-600',
    gmail:           'bg-red-100 text-red-600',
    slack:           'bg-purple-100 text-purple-600',
    googleSheets:    'bg-green-100 text-green-600',
    openAi:          'bg-teal-100 text-teal-600',
    if:              'bg-yellow-100 text-yellow-600',
    set:             'bg-slate-100 text-slate-600',
    code:            'bg-indigo-100 text-indigo-600',
  };
  return map[base] ?? 'bg-slate-100 text-slate-600';
}

export function WorkflowSteps({ steps, explanation }: WorkflowStepsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
        <span className="mt-0.5 shrink-0">💡</span>
        <span>{explanation}</span>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* connector */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${nodeColor(step.nodeType)}`}>
                {nodeIcon(step.nodeType)}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px h-4 bg-slate-200 mt-1" />
              )}
            </div>
            <div className="pb-2">
              <p className="text-sm font-medium text-slate-800">{step.nodeName}</p>
              <p className="text-xs text-slate-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
