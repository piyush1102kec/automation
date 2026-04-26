import Anthropic from '@anthropic-ai/sdk';
import { searchGoogle, buildSearchQuery, type SerpResult } from './serp';
import { POST_TYPES, type PostType, type PostTone } from './post-types';
import { PLATFORMS, getPlatformPostType, type PlatformId } from './platforms';
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
  postType: PostType | string,
  topic: string,
  tone: PostTone | string,
  platform: PlatformId = 'linkedin',
): AsyncGenerator<string> {
  const startTime = Date.now();

  // Resolve system prompt and content guidance — platform post types take priority
  let systemPrompt: string;
  let contentGuidance: string;
  let postTypeLabel: string;
  let maxChars: number;

  const platformPostType = getPlatformPostType(platform, postType);
  if (platformPostType) {
    systemPrompt = platformPostType.systemPrompt;
    contentGuidance = platformPostType.contentGuidance;
    postTypeLabel = platformPostType.label;
    maxChars = PLATFORMS[platform].maxChars;
  } else {
    // Fall back to legacy LinkedIn post types
    const config = POST_TYPES[postType as PostType];
    systemPrompt = config?.systemPrompt ?? 'You are a professional content writer.';
    contentGuidance = config?.contentGuidance ?? '';
    postTypeLabel = config?.label ?? postType;
    maxChars = 3000;
  }

  const platformLabel = PLATFORMS[platform]?.name ?? 'LinkedIn';

  // Research phase
  const query = buildSearchQuery(postType as PostType, topic);
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

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1200,
    system: systemPrompt,
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
