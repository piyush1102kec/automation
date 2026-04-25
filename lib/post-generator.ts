import Anthropic from '@anthropic-ai/sdk';
import { searchGoogle, buildSearchQuery, type SerpResult } from './serp';
import { POST_TYPES, type PostType, type PostTone } from './post-types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GenerateResult {
  content: string;
  research: {
    query: string;
    results: SerpResult[];
    summary: string;
  };
}

export async function generatePost(
  postType: PostType,
  topic: string,
  tone: PostTone,
): Promise<GenerateResult> {
  const config = POST_TYPES[postType];

  // Step 1: Research via SerpAPI
  const query = buildSearchQuery(postType, topic);
  const results = await searchGoogle(query);

  // Step 2: Research synthesis via Claude
  let researchSummary = '';
  if (results.length > 0) {
    const researchRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      system: 'You are a research assistant. Extract the 3-5 most relevant, specific, and recent insights from the provided search results. Focus on data points, statistics, and concrete examples. Be concise.',
      messages: [{
        role: 'user',
        content: `Topic: ${topic}\n\nSearch Results:\n${results.map((r, i) =>
          `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.url}`
        ).join('\n\n')}\n\nExtract key insights relevant to a LinkedIn post about "${topic}".`,
      }],
    });
    researchSummary = (researchRes.content[0] as { text: string }).text;
  }

  // Step 3: Post drafting via Claude
  const toneInstructions: Record<PostTone, string> = {
    professional: 'Tone: Professional, authoritative, and insight-driven.',
    casual: 'Tone: Conversational, warm, and approachable. Like talking to a peer.',
    provocative: 'Tone: Bold and contrarian. Challenge conventional wisdom. Make people stop scrolling.',
    storytelling: 'Tone: Narrative-driven. Start with a scene or moment. Draw the reader in.',
  };

  const userPrompt = `Draft a LinkedIn post for Bitloom.

Post Type: ${config.label}
Topic: ${topic}
${toneInstructions[tone]}
Content Guidance: ${config.contentGuidance}

${researchSummary ? `Research Insights:\n${researchSummary}` : 'Write from your knowledge of AI/CRM trends.'}

Return ONLY the final LinkedIn post, ready to publish. No preamble, no explanation.`;

  const draftRes = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: config.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = (draftRes.content[0] as { text: string }).text;

  return {
    content,
    research: { query, results, summary: researchSummary },
  };
}

export async function* generatePostStream(
  postType: PostType,
  topic: string,
  tone: PostTone,
): AsyncGenerator<string> {
  const config = POST_TYPES[postType];

  // Research phase (non-streaming)
  const query = buildSearchQuery(postType, topic);
  const results = await searchGoogle(query);

  let researchSummary = '';
  if (results.length > 0) {
    const researchRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
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

  // Streaming draft phase
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-5',
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

  // Yield research metadata as final JSON marker
  yield `\n\n__RESEARCH__${JSON.stringify({ query, results, summary: researchSummary })}`;
}
