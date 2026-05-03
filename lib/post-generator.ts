import OpenAI from 'openai';
import { searchGoogle, buildSearchQuery, type SerpResult } from './serp';
import { POST_TYPES, type PostType, type PostTone } from './post-types';
import { calcCostUsd } from './cost-calculator';

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

export interface GenerateMeta {
  inputTokens: number;
  outputTokens: number;
  timeMs: number;
  costUsd: number;
  model: string;
  query: string;
  results: SerpResult[];
  researchSummary: string;
}

export async function* generatePostStream(
  postType: PostType | string,
  topic: string,
  tone: PostTone | string,
  platform: string = 'linkedin',
): AsyncGenerator<string> {
  const startTime = Date.now();

  // Resolve system prompt and content guidance
  const config = POST_TYPES[postType as PostType];
  const systemPrompt = config?.systemPrompt ?? 'You are a professional content writer.';
  const contentGuidance = config?.contentGuidance ?? '';
  const postTypeLabel = config?.label ?? postType;
  const maxChars = 3000;

  const platformLabel = platform === 'linkedin' ? 'LinkedIn' : platform;

  // Research phase
  const query = buildSearchQuery(postType as PostType, topic);
  const results = await searchGoogle(query);

  let researchSummary = '';
  let researchInputTokens = 0;
  let researchOutputTokens = 0;

  if (results.length > 0) {
    const researchRes = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 800,
      messages: [
        { role: 'system', content: 'You are a research assistant. Extract 3-5 specific, recent insights from search results. Concise bullet points only.' },
        {
          role: 'user',
          content: `Topic: ${topic}\n\n${results.map((r, i) =>
            `[${i + 1}] ${r.title}\n${r.snippet}`
          ).join('\n\n')}\n\nKey insights for: "${topic}"`,
        }
      ],
    });
    researchSummary = researchRes.choices[0].message.content ?? '';
    researchInputTokens = researchRes.usage?.prompt_tokens ?? 0;
    researchOutputTokens = researchRes.usage?.completion_tokens ?? 0;
  }

  const toneInstructions: Record<string, string> = {
    professional: 'Tone: Professional, authoritative, insight-driven.',
    casual: 'Tone: Conversational and warm. Like talking to a peer.',
    provocative: 'Tone: Bold and contrarian. Challenge conventional wisdom.',
    storytelling: 'Tone: Narrative-driven. Start with a scene or moment.',
  };
  const toneInstruction = toneInstructions[tone] ?? `Tone: ${tone}.`;

  const userPrompt = `Draft a ${platformLabel} post for Bitloom.

Platform: ${platformLabel} (max ${maxChars} characters)
Post Type: ${postTypeLabel}
Topic: ${topic}
${toneInstruction}
Content Guidance: ${contentGuidance}

${researchSummary ? `Research:\n${researchSummary}` : ''}

Return ONLY the final post content. No preamble. Respect the character limit.`;

  const stream = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    stream: true,
  });

  let draftOutputText = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    draftOutputText += content;
    yield content;
  }

  // Local Ollama usage reporting in stream is often missing, so we approximate
  const totalInput = researchInputTokens; 
  const totalOutput = researchOutputTokens; 
  const timeMs = Date.now() - startTime;
  const costUsd = calcCostUsd(MODEL, totalInput, totalOutput);

  const meta: GenerateMeta = {
    inputTokens: totalInput,
    outputTokens: totalOutput,
    timeMs,
    costUsd,
    model: MODEL,
    query,
    results,
    researchSummary,
  };

  yield `\n\n__META__${JSON.stringify(meta)}`;
}
