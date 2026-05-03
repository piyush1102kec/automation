'use client';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const EXAMPLES = [
  'Every Monday at 9am, send me an email summary of AI news',
  'When a webhook fires, summarize the payload with AI and post to Slack',
  'Every hour, fetch data from an API and save new rows to Google Sheets',
  'Every Friday, generate a LinkedIn post about CRM trends and email it to me',
];

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">
          Describe your automation
        </label>
        <span className={`text-xs font-mono tabular-nums ${value.length > 450 ? 'text-amber-500' : 'text-slate-400'}`}>
          {value.length} / 500
        </span>
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        maxLength={500}
        rows={4}
        placeholder="e.g. Every Monday morning, fetch the top 5 AI headlines and email them to me with a short summary"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-linkedin/30 focus:border-linkedin focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {!value && !disabled && (
        <div className="space-y-1.5">
          <p className="section-label">Try an example</p>
          <div className="grid grid-cols-1 gap-1.5">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(ex)}
                className="text-xs bg-white hover:bg-linkedin-light border border-slate-200 hover:border-linkedin/30 text-slate-600 hover:text-linkedin rounded-lg px-3 py-2 transition-all text-left"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
