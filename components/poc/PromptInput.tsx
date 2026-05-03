'use client';

interface PromptInputProps {
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const EXAMPLES = [
  'Every Monday at 9am, send me an email summary of AI news',
  'When a webhook is called, save the data to Google Sheets',
  'Every day at 8am, check our website is up and send a Slack alert if it\'s down',
  'When a new row is added to Google Sheets, send a welcome email via Gmail',
];

export function PromptInput({ value, onChange, onGenerate, isGenerating }: PromptInputProps) {
  return (
    <div className="card p-4 space-y-3">
      <label className="section-label">Describe your automation</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. Every Monday at 9am, fetch the latest AI news and email me a summary"
        rows={3}
        className="input-base resize-none"
      />

      <div className="space-y-1.5">
        <p className="text-xs text-slate-400">Examples — click to use:</p>
        <div className="flex flex-col gap-1">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => onChange(ex)}
              className="text-left text-xs text-slate-500 hover:text-linkedin hover:bg-slate-50 px-2 py-1.5 rounded-md transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!value.trim() || isGenerating}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-linkedin hover:bg-linkedin/90 text-white px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40"
      >
        {isGenerating ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating workflow…
          </>
        ) : (
          'Generate Workflow'
        )}
      </button>
    </div>
  );
}
