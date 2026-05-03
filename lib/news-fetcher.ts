import OpenAI from 'openai';
import { clearAndInsertNews, getNewsAge, getNewsBySource, type NewsItem } from './db-queries';

// Use Groq if available, else fall back to Ollama
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const useGroq = !!GROQ_API_KEY;

const openai = new OpenAI(
  useGroq
    ? { apiKey: GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' }
    : { apiKey: 'ollama', baseURL: `${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/v1` }
);

const MODEL = useGroq
  ? (process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile')
  : (process.env.OLLAMA_MODEL ?? 'qwen2.5:7b');

const CREATIO_NEWS_URL = 'https://www.creatio.com/company/news';
const SIX_HOURS = 6 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

async function fetchCreatioNews(): Promise<Omit<NewsItem, 'id' | 'fetched_at'>[]> {
  try {
    const res = await fetch(CREATIO_NEWS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PostPilot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];
    const html = await res.text();

    // Extract news items from HTML using patterns common to news pages
    const items: Omit<NewsItem, 'id' | 'fetched_at'>[] = [];

    // Pattern: look for h2/h3 tags with anchors that look like news titles
    const articlePattern = /<(?:h[23]|a)[^>]*href="([^"]*)"[^>]*>\s*([^<]{20,200})\s*</gi;
    const matches = Array.from(html.matchAll(articlePattern));

    for (const match of matches.slice(0, 15)) {
      const rawUrl = match[1];
      const title = match[2].trim().replace(/\s+/g, ' ');

      if (title.length < 20) continue;
      if (/nav|menu|footer|cookie|privacy/i.test(rawUrl)) continue;

      const url = rawUrl.startsWith('http')
        ? rawUrl
        : `https://www.creatio.com${rawUrl}`;

      // Look for a snippet near this match
      const matchIdx = html.indexOf(match[0]);
      const snippet = html.slice(matchIdx + match[0].length, matchIdx + match[0].length + 400)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200);

      items.push({
        source: 'creatio',
        title,
        summary: snippet || null,
        url,
        published_at: null,
      });

      if (items.length >= 8) break;
    }

    return items;
  } catch {
    return [];
  }
}

async function generateBfsiInsights(): Promise<Omit<NewsItem, 'id' | 'fetched_at'>[]> {
  try {
    const res = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Generate 6 current and highly relevant BFSI (Banking, Financial Services, Insurance) technology trends for 2025 that align specifically with Creatio CRM + AI automation capabilities and Bitloom's consulting practice.

For each trend, provide:
1. A compelling headline (60-80 chars)
2. A 2-3 sentence summary explaining the trend and how Creatio/Bitloom can help
3. A relevance note (1 sentence): how this creates a business opportunity for Bitloom

Format as JSON array:
[
  {
    "title": "...",
    "summary": "...",
    "url": null,
    "published_at": null
  }
]

Focus on: AI-driven underwriting, no-code CRM automation, omnichannel banking, RegTech, embedded finance, claims automation, wealth management digitization.

Return ONLY the JSON array, no other text.`,
      }],
    });

    const text = res.choices[0].message.content?.trim() || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      title: string;
      summary: string;
      url: string | null;
      published_at: string | null;
    }>;

    return parsed.map(item => ({
      source: 'bfsi' as const,
      title: item.title,
      summary: item.summary,
      url: item.url,
      published_at: item.published_at,
    }));
  } catch {
    return [];
  }
}

export async function getOrRefreshCreatioNews(force = false): Promise<NewsItem[]> {
  const age = getNewsAge('creatio');

  if (!force && age < SIX_HOURS) {
    return getNewsBySource('creatio', 10);
  }

  const fresh = await fetchCreatioNews();

  if (fresh.length > 0) {
    clearAndInsertNews('creatio', fresh);
  } else if (age === Infinity) {
    // Seed with static fallback if we've never fetched
    clearAndInsertNews('creatio', [
      {
        source: 'creatio',
        title: 'Creatio Unveils AI-Native CRM Platform at CRM Conference 2025',
        summary: 'Creatio announced major enhancements to its AI-powered CRM, including generative AI tools that allow business users to build automations without coding.',
        url: CREATIO_NEWS_URL,
        published_at: null,
      },
      {
        source: 'creatio',
        title: 'Creatio Recognized as a Leader in Gartner Magic Quadrant for CRM',
        summary: 'Creatio continues to be recognized for its vision and ability to execute in the CRM space, particularly for mid-market and enterprise B2B companies.',
        url: CREATIO_NEWS_URL,
        published_at: null,
      },
      {
        source: 'creatio',
        title: 'New Industry Accelerators for BFSI Released by Creatio',
        summary: 'Creatio launched pre-built automation templates and workflows tailored for banking, insurance, and financial services companies to accelerate time-to-value.',
        url: CREATIO_NEWS_URL,
        published_at: null,
      },
    ]);
  }

  return getNewsBySource('creatio', 10);
}

export async function getOrRefreshBfsiInsights(force = false): Promise<NewsItem[]> {
  const age = getNewsAge('bfsi');

  if (!force && age < TWENTY_FOUR_HOURS) {
    return getNewsBySource('bfsi', 8);
  }

  const fresh = await generateBfsiInsights();

  if (fresh.length > 0) {
    clearAndInsertNews('bfsi', fresh);
  }

  return getNewsBySource('bfsi', 8);
}
