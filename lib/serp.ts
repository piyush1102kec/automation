export interface SerpResult {
  title: string;
  snippet: string;
  url: string;
}

export async function searchGoogle(query: string): Promise<SerpResult[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.warn('SERPAPI_KEY not set — skipping web search');
    return [];
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    engine: 'google',
    q: query,
    num: '5',
    hl: 'en',
  });

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.organic_results ?? []).slice(0, 5).map((r: Record<string, string>) => ({
      title: r.title ?? '',
      snippet: r.snippet ?? '',
      url: r.link ?? '',
    }));
  } catch {
    return [];
  }
}

export function buildSearchQuery(postType: string, topic: string): string {
  const suffix = 'site:linkedin.com OR site:forrester.com OR site:gartner.com OR site:mckinsey.com 2024 OR 2025';
  return `${topic} ${suffix}`;
}
