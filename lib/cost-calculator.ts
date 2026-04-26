export const MODEL_PRICING: Record<string, { inputPerMTok: number; outputPerMTok: number; label: string }> = {
  'claude-sonnet-4-5': { inputPerMTok: 3.0, outputPerMTok: 15.0, label: 'Sonnet 4.5' },
  'claude-sonnet-4-6': { inputPerMTok: 3.0, outputPerMTok: 15.0, label: 'Sonnet 4.6' },
  'claude-haiku-4-5-20251001': { inputPerMTok: 0.8, outputPerMTok: 4.0, label: 'Haiku 4.5' },
};

export function calcCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const p = MODEL_PRICING[model] ?? { inputPerMTok: 3.0, outputPerMTok: 15.0, label: 'Unknown' };
  return (inputTokens / 1_000_000) * p.inputPerMTok + (outputTokens / 1_000_000) * p.outputPerMTok;
}

export function formatCostUsd(usd: number): string {
  if (usd === 0) return '$0.000';
  if (usd < 0.0001) return `<$0.0001`;
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDuration(ms: number): string {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}
