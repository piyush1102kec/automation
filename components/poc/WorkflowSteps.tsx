'use client';

import {
  Clock, Zap, Globe, Mail, MessageSquare,
  Table2, Sparkles, GitBranch, Settings2, Code,
} from 'lucide-react';
import type { WorkflowStep } from '@/types/n8n';

const NODE_ICON: Record<string, React.ElementType> = {
  scheduleTrigger: Clock,
  webhook:         Zap,
  httpRequest:     Globe,
  gmail:           Mail,
  slack:           MessageSquare,
  googleSheets:    Table2,
  openAi:          Sparkles,
  if:              GitBranch,
  set:             Settings2,
  code:            Code,
};

const NODE_COLOR: Record<string, string> = {
  scheduleTrigger: 'bg-violet-100 text-violet-600 border-violet-200',
  webhook:         'bg-amber-100 text-amber-600 border-amber-200',
  httpRequest:     'bg-sky-100 text-sky-600 border-sky-200',
  gmail:           'bg-red-100 text-red-600 border-red-200',
  slack:           'bg-emerald-100 text-emerald-600 border-emerald-200',
  googleSheets:    'bg-green-100 text-green-600 border-green-200',
  openAi:          'bg-indigo-100 text-indigo-600 border-indigo-200',
  if:              'bg-orange-100 text-orange-600 border-orange-200',
  set:             'bg-slate-100 text-slate-600 border-slate-200',
  code:            'bg-zinc-100 text-zinc-600 border-zinc-200',
};

interface WorkflowStepsProps {
  steps: WorkflowStep[];
  explanation: string;
}

export function WorkflowSteps({ steps, explanation }: WorkflowStepsProps) {
  if (!steps.length) return null;

  return (
    <div className="card p-4 space-y-4 animate-fade-in">
      {/* Explanation */}
      <div className="flex items-start gap-3 p-3 bg-linkedin-light border border-linkedin/20 rounded-lg">
        <Sparkles className="w-4 h-4 text-linkedin mt-0.5 shrink-0" />
        <p className="text-sm text-linkedin font-medium leading-snug">{explanation}</p>
      </div>

      {/* Step list */}
      <div>
        <p className="section-label mb-3">Workflow steps</p>
        <div className="space-y-0">
          {steps.map((step, i) => {
            const baseType = step.nodeType.replace('n8n-nodes-base.', '');
            const Icon     = NODE_ICON[baseType] ?? Settings2;
            const color    = NODE_COLOR[baseType] ?? 'bg-slate-100 text-slate-600 border-slate-200';
            const isLast   = i === steps.length - 1;

            return (
              <div key={i} className="flex items-start gap-3">
                {/* Icon + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {!isLast && <div className="w-px h-4 bg-slate-200 mt-0.5" />}
                </div>

                {/* Content */}
                <div className={`${isLast ? 'pb-0' : 'pb-4'} pt-1 min-w-0`}>
                  <p className="text-xs font-semibold text-slate-800">{step.nodeName}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
