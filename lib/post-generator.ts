import Anthropic from '@anthropic-ai/sdk';
import { searchGoogle, buildSearchQuery, type SerpResult } from './serp';
import { POST_TYPES, type PostType, type PostTone } from './post-types';
import { calcCostUsd } from './cost-calculator';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-5';

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
  postType: PostType,
  topic: string,
  tone: PostTone,
): AsyncGenerator<string> {
  const startTime = Date.now();
  const config = POST_TYPES[postType];

  // Research phase
  const query = buildSearchQuery(postType, topic);
  const results = await searchGoogle(query);

  let researchSummary = '';
  let researchInputTokens = 0;
  let researchOutputTokens = 0;

  if (results.length > 0) {
    const researchRes = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: 'You are a research assistant. Extract 3-5 specific, recent insights from search results. Concise bullet points only.',
      messages: [{
        role: 'user',
        content: `Topic: ${topic}\n\n${results.map((r, i) =>
          `[${i + 1}] ${r.title}\n${r.snippet}`
        ).join('\n\n')}\n\nKey insights for: "${topic}"`,
      }],
    });
    researchSummary = (researchRes.content[0] as { text: string }).text;
    researchInputTokens = researchRes.usage.input_tokens;
    researchOutputTokens = researchRes.usage.output_tokens;
  }

  const toneInstructions: Record<PostTone, string> = {
    professional: 'Tone: Professional, authoritative, insight-driven.',
    casual: 'Tone: Conversational and warm. Like talking to a peer.',
    provocative: 'Tone: Bold and contrarian. Challenge conventional wisdom.',
    storytelling: 'Tone: Narrative-driven. Start with a scene or moment.',
  };

  const userPrompt = `Draft a LinkedIn post for Bitloom.

Post Type: ${config.label}
Topic: ${topic}
${toneInstructions[tone]}
Content Guidance: ${config.contentGuidance}

${researchSummary ? `Research:\n${researchSummary}` : ''}

Return ONLY the final LinkedIn post. No preamble.`;

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: config.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }

  const finalMsg = await stream.finalMessage();
  const draftInputTokens = finalMsg.usage.input_tokens;
  const draftOutputTokens = finalMsg.usage.output_tokens;

  const totalInput = researchInputTokens + draftInputTokens;
  const totalOutput = researchOutputTokens + draftOutputTokens;
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
