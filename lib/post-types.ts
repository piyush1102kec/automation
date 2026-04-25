export const POST_TYPES = {
  thought_leadership: {
    label: 'Thought Leadership',
    color: '#0A66C2',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    days: [1],
    defaultTopic: 'What most businesses get wrong about CRM adoption and AI automation',
    systemPrompt: `You are a LinkedIn content writer for Bitloom, an AI + CRM automation startup specialising in Creatio implementation for SMBs. Voice: confident, insight-driven, accessible, human. Avoid buzzwords. Short paragraphs. Add 3-5 relevant hashtags at the end. Never start with 'I' or clichés. Write posts that provide genuine value to SMB decision-makers.`,
    contentGuidance: 'Write a thought-provoking GENERIC post challenging a common CRM assumption. Share Bitloom POV on AI + Creatio automation. 150-200 words. Text-only format for max reach. End with a question to drive comments. No promotional language.',
  },
  creatio_insight: {
    label: 'Creatio Insight',
    color: '#00A0DC',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    days: [2],
    defaultTopic: 'How Creatio CRM and AI automation are shaping the future of financial services',
    systemPrompt: `You are a B2B LinkedIn content strategist for Bitloom, targeting SMB decision-makers in BFSI. Voice: authoritative, data-informed, practical. No jargon. Short paragraphs. 3-5 hashtags at the end.`,
    contentGuidance: 'Write a GENERIC insight post about how Creatio CRM and AI automation are transforming financial services. 150-200 words. Text-only for max reach. Include BFSI pain points, highlight Creatio capabilities, end with a question. SEO-optimized. No promotional language.',
  },
  quiz: {
    label: 'Quiz',
    color: '#F5A623',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    days: [3],
    defaultTopic: 'AI and no-code automation knowledge quiz',
    systemPrompt: `You create engaging LinkedIn quiz posts for Bitloom's audience of SMB decision-makers. Educational, fun, and relevant to AI/CRM/automation.`,
    contentGuidance: 'Create a LinkedIn QUIZ-style post. Start with "Quick quiz:" and present a scenario about AI in business automation or CRM. Give 3 possible answers A, B, C. Reveal correct answer at the end with brief explanation. Educational and fun. 100-150 words.',
  },
  employee_pov: {
    label: 'Employee POV',
    color: '#7B68EE',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    days: [4, 0, 6],
    defaultTopic: 'Team member perspective on Bitloom + Creatio implementation story',
    systemPrompt: `You draft authentic first-person LinkedIn posts from Bitloom team members. Warm, personal, and genuine. Avoid corporate speak. Real insights from real work.`,
    contentGuidance: 'Draft a personal LinkedIn post from POV of a Bitloom team member. Share a real implementation story, lesson learned, or client insight about Creatio CRM. Tag @Bitloom.ai and @Creatio. Authentic, first-person tone. 100-150 words.',
  },
  story: {
    label: 'Story / BTS',
    color: '#E8542C',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    days: [5],
    defaultTopic: 'Bitloom team milestone, client win, or lesson learned',
    systemPrompt: `You write warm, human behind-the-scenes posts for Bitloom's LinkedIn. Storytelling format, short paragraphs, genuine emotion. No buzzwords.`,
    contentGuidance: 'Write a behind-the-scenes post about Bitloom journey. Share a team milestone, client win (anonymized), or key lesson learned. Human, warm tone. 120-180 words. Short paragraphs.',
  },
} as const;

export type PostType = keyof typeof POST_TYPES;
export type PostStatus = 'draft' | 'scheduled' | 'posted' | 'skipped';
export type PostSource = 'manual' | 'scheduled';
export type PostTone = 'professional' | 'casual' | 'provocative' | 'storytelling';

export const TONES: Record<PostTone, string> = {
  professional: 'Professional',
  casual: 'Casual & Friendly',
  provocative: 'Bold & Provocative',
  storytelling: 'Storytelling',
};

export function getTodayPostType(): PostType {
  const day = new Date().getDay();
  for (const [type, config] of Object.entries(POST_TYPES)) {
    if ((config.days as readonly number[]).includes(day)) return type as PostType;
  }
  return 'thought_leadership';
}

export function getTomorrowPostType(): PostType {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = tomorrow.getDay();
  for (const [type, config] of Object.entries(POST_TYPES)) {
    if ((config.days as readonly number[]).includes(day)) return type as PostType;
  }
  return 'thought_leadership';
}
