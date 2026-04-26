// ─────────────────────────────────────────────────────────────
//  Platform definitions + per-platform post type configs
// ─────────────────────────────────────────────────────────────

export type PlatformId = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'threads';

export interface PlatformPostType {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  defaultTopic: string;
  systemPrompt: string;
  contentGuidance: string;
}

export interface Platform {
  id: PlatformId;
  name: string;           // display name
  label: string;          // alias
  profileUrl: string;     // link to post on the platform
  color: string;
  bgColor: string;
  textColor: string;
  maxChars: number;
  idealChars: number;
  hashtagRange: [number, number] | null;
  contentNote: string;
  postTypes: Record<string, PlatformPostType>;
}

export const PLATFORMS: Record<PlatformId, Platform> = {

  // ── LinkedIn ──────────────────────────────────────────────────
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    label: 'LinkedIn',
    profileUrl: 'https://www.linkedin.com/feed/',
    color: '#0A66C2',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    maxChars: 3000,
    idealChars: 1500,
    hashtagRange: [3, 5],
    contentNote: 'Professional B2B tone. Short paragraphs. End with a question.',
    postTypes: {
      thought_leadership: {
        id: 'thought_leadership',
        label: 'Thought Leadership',
        color: '#0A66C2', bgColor: 'bg-blue-100', textColor: 'text-blue-700',
        defaultTopic: 'What most businesses get wrong about CRM adoption and AI automation',
        systemPrompt: `You are a LinkedIn content writer for Bitloom, an AI + CRM automation startup specialising in Creatio implementation for SMBs. Voice: confident, insight-driven, accessible, human. Avoid buzzwords. Short paragraphs. Add 3-5 relevant hashtags at the end. Never start with 'I' or clichés. Write posts that provide genuine value to SMB decision-makers.`,
        contentGuidance: 'Write a thought-provoking GENERIC post challenging a common CRM assumption. Share Bitloom POV on AI + Creatio automation. 150-200 words. Text-only format for max reach. End with a question to drive comments. No promotional language.',
      },
      creatio_insight: {
        id: 'creatio_insight',
        label: 'Creatio Insight',
        color: '#00A0DC', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700',
        defaultTopic: 'How Creatio CRM and AI automation are shaping the future of financial services',
        systemPrompt: `You are a B2B LinkedIn content strategist for Bitloom, targeting SMB decision-makers in BFSI. Voice: authoritative, data-informed, practical. No jargon. Short paragraphs. 3-5 hashtags at the end.`,
        contentGuidance: 'Write a GENERIC insight post about how Creatio CRM and AI automation are transforming financial services. 150-200 words. Text-only for max reach. Include BFSI pain points, highlight Creatio capabilities, end with a question. No promotional language.',
      },
      quiz: {
        id: 'quiz',
        label: 'Quiz',
        color: '#F5A623', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700',
        defaultTopic: 'AI and no-code automation knowledge quiz',
        systemPrompt: `You create engaging LinkedIn quiz posts for Bitloom's audience of SMB decision-makers. Educational, fun, and relevant to AI/CRM/automation.`,
        contentGuidance: 'Create a LinkedIn QUIZ-style post. Start with "Quick quiz:" and present a scenario about AI in business automation or CRM. Give 3 possible answers A, B, C. Reveal correct answer at the end with brief explanation. 100-150 words.',
      },
      employee_pov: {
        id: 'employee_pov',
        label: 'Employee POV',
        color: '#7B68EE', bgColor: 'bg-purple-100', textColor: 'text-purple-700',
        defaultTopic: 'Team member perspective on Bitloom + Creatio implementation story',
        systemPrompt: `You draft authentic first-person LinkedIn posts from Bitloom team members. Warm, personal, and genuine. Avoid corporate speak. Real insights from real work.`,
        contentGuidance: 'Draft a personal LinkedIn post from POV of a Bitloom team member. Share a real implementation story, lesson learned, or client insight about Creatio CRM. Authentic, first-person tone. 100-150 words.',
      },
      story: {
        id: 'story',
        label: 'Story / BTS',
        color: '#E8542C', bgColor: 'bg-orange-100', textColor: 'text-orange-700',
        defaultTopic: 'Bitloom team milestone, client win, or lesson learned',
        systemPrompt: `You write warm, human behind-the-scenes posts for Bitloom's LinkedIn. Storytelling format, short paragraphs, genuine emotion. No buzzwords.`,
        contentGuidance: 'Write a behind-the-scenes post about Bitloom journey. Share a team milestone, client win (anonymized), or key lesson learned. Human, warm tone. 120-180 words. Short paragraphs.',
      },
    },
  },

  // ── Twitter / X ───────────────────────────────────────────────
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    label: 'X (Twitter)',
    profileUrl: 'https://x.com/compose/tweet',
    color: '#000000',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-800',
    maxChars: 280,
    idealChars: 220,
    hashtagRange: [1, 2],
    contentNote: 'Max 280 chars. Punchy and direct. 1-2 hashtags only.',
    postTypes: {
      hot_take: {
        id: 'hot_take',
        label: 'Hot Take',
        color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-700',
        defaultTopic: 'Most CRM implementations fail before they start',
        systemPrompt: `You write punchy, bold Twitter/X posts for Bitloom. Contrarian, confident, and scroll-stopping. Under 280 characters including hashtags.`,
        contentGuidance: 'Write a bold, contrarian opinion about CRM, AI, or BFSI technology. Under 260 characters. One big idea, stated confidently. Max 1-2 hashtags at the end. No threads — single tweet only. Make it shareable.',
      },
      thread_opener: {
        id: 'thread_opener',
        label: 'Thread Opener',
        color: '#3B82F6', bgColor: 'bg-blue-100', textColor: 'text-blue-700',
        defaultTopic: 'How Creatio CRM transforms BFSI operations — a breakdown',
        systemPrompt: `You write compelling thread-opener tweets for Bitloom's X/Twitter account. The opener must make people want to read the full thread. Hook-driven, promise-heavy.`,
        contentGuidance: 'Write ONLY the opening tweet of a thread. Format: Hook statement on line 1. Then "A thread 🧵" on line 2. Then a one-line preview of what the thread covers. Under 280 chars total. Make the hook irresistible — a surprising stat, bold claim, or compelling question.',
      },
      quick_tip: {
        id: 'quick_tip',
        label: 'Quick Tip',
        color: '#10B981', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700',
        defaultTopic: 'One CRM automation tip that saves hours every week',
        systemPrompt: `You write actionable, concise tips for Bitloom's X account. Focus on AI, CRM, and automation. Practical, specific, and immediately useful.`,
        contentGuidance: 'Write a single actionable tip about CRM automation, AI workflows, or BFSI digitization. Format: "Tip: [action]" then a 1-2 sentence explanation of why/how. Under 250 characters. Add 1 relevant hashtag. Specific beats generic.',
      },
      industry_stat: {
        id: 'industry_stat',
        label: 'Industry Stat',
        color: '#8B5CF6', bgColor: 'bg-violet-100', textColor: 'text-violet-700',
        defaultTopic: 'BFSI digital transformation statistics 2025',
        systemPrompt: `You write stat-driven tweets for Bitloom. Share a compelling industry statistic with a sharp insight. Data-first, Bitloom-relevant.`,
        contentGuidance: 'Share ONE compelling statistic about BFSI digitization, CRM ROI, or AI adoption. Then 1 sentence of sharp insight or implication for decision-makers. Under 260 characters. Can be slightly fictional but plausible if no real stat is available — label it as "industry estimate". 1-2 hashtags.',
      },
    },
  },

  // ── Instagram ─────────────────────────────────────────────────
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    label: 'Instagram',
    profileUrl: 'https://www.instagram.com/',
    color: '#E1306C',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    maxChars: 2200,
    idealChars: 1000,
    hashtagRange: [10, 20],
    contentNote: 'Visual-first. Hook in first line. Heavy hashtags at the end.',
    postTypes: {
      feed_caption: {
        id: 'feed_caption',
        label: 'Feed Caption',
        color: '#E1306C', bgColor: 'bg-pink-100', textColor: 'text-pink-700',
        defaultTopic: 'The future of AI in banking and financial services',
        systemPrompt: `You write Instagram captions for Bitloom. Visual-first, conversational, and hashtag-rich. The first line must be a scroll-stopping hook under 125 characters (visible before "more"). Warm, human, and inspiring. 10-20 targeted hashtags at the end.`,
        contentGuidance: 'Write an Instagram caption. Line 1: Hook (under 125 chars, no hashtags). Then 2-3 short paragraphs of value. Then a CTA (save this / share with a friend / comment below). Then blank line. Then 15-20 targeted hashtags. Total under 1000 chars before hashtags.',
      },
      reel_hook: {
        id: 'reel_hook',
        label: 'Reel Hook',
        color: '#F97316', bgColor: 'bg-orange-100', textColor: 'text-orange-700',
        defaultTopic: '3 signs your CRM is costing you more than it should',
        systemPrompt: `You write Instagram Reels scripts for Bitloom. Super short, energetic hook + quick value delivery. Designed to keep viewers watching past the first 3 seconds.`,
        contentGuidance: 'Write an Instagram Reel caption: Line 1: HOOK (e.g. "Stop doing this with your CRM 🛑") — under 100 chars. Then 3-5 bullet points of the content/value delivered in the video. Then CTA: "Follow for more". Then 10-15 hashtags. Total caption under 800 chars.',
      },
      carousel: {
        id: 'carousel',
        label: 'Carousel Copy',
        color: '#6366F1', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700',
        defaultTopic: '5 ways Creatio CRM transforms BFSI operations',
        systemPrompt: `You write Instagram carousel captions for Bitloom. Each slide gets a bold headline + 1-2 sentences of body copy. Educational, snackable, and shareable.`,
        contentGuidance: 'Write carousel content. Format: Caption line (hook) + "Swipe → to see all [N] slides". Then list each slide: SLIDE 1: [Bold Headline] / [1-2 sentence explanation]. Repeat for 5-7 slides. Final slide: CTA + follow + save. Then 15 hashtags.',
      },
      bts_caption: {
        id: 'bts_caption',
        label: 'Behind the Scenes',
        color: '#0EA5E9', bgColor: 'bg-sky-100', textColor: 'text-sky-700',
        defaultTopic: 'A day in the life at Bitloom — our team and culture',
        systemPrompt: `You write authentic Instagram BTS (behind-the-scenes) captions for Bitloom. Human, warm, and genuine. Let the team's personality shine. Make followers feel like insiders.`,
        contentGuidance: 'Write a warm BTS caption for an Instagram post showing Bitloom team/work culture. First line: relatable hook. Then 2-3 short paragraphs of genuine storytelling. CTA: "Tag someone who needs to see this" or "Save for later". Then 10-15 hashtags focused on startup/tech culture.',
      },
    },
  },

  // ── Facebook ──────────────────────────────────────────────────
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    label: 'Facebook',
    profileUrl: 'https://www.facebook.com/',
    color: '#1877F2',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    maxChars: 63206,
    idealChars: 500,
    hashtagRange: [2, 5],
    contentNote: 'Community-focused. Conversational. Ask questions. Keep it shareable.',
    postTypes: {
      community_post: {
        id: 'community_post',
        label: 'Community Post',
        color: '#1877F2', bgColor: 'bg-blue-100', textColor: 'text-blue-700',
        defaultTopic: 'What challenges do BFSI teams face with CRM adoption?',
        systemPrompt: `You write Facebook posts for Bitloom's business page. Community-first, conversational, and designed to spark comments and shares. Warm but professional.`,
        contentGuidance: 'Write a Facebook post that sparks conversation. Ask 1 open-ended question relevant to CRM/AI/BFSI. Then share a brief perspective (2-3 sentences). End with the question again to drive comments. 150-300 words. 2-3 hashtags. Casual and inviting tone.',
      },
      educational: {
        id: 'educational',
        label: 'Educational',
        color: '#10B981', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700',
        defaultTopic: 'How no-code CRM automation works for financial services firms',
        systemPrompt: `You write educational Facebook posts for Bitloom. Teach something valuable about AI, CRM, or BFSI transformation. Easy to understand, no jargon, highly shareable.`,
        contentGuidance: 'Write an educational Facebook post that teaches something about CRM automation or AI in BFSI. Format: Bold statement opener. Then 3-5 numbered lessons/points. Then a closing takeaway. 250-400 words. Highly shareable, jargon-free. 2-4 hashtags.',
      },
      success_story: {
        id: 'success_story',
        label: 'Success Story',
        color: '#F59E0B', bgColor: 'bg-amber-100', textColor: 'text-amber-700',
        defaultTopic: 'How a financial services client reduced manual work by 60% with Creatio',
        systemPrompt: `You write Facebook success story posts for Bitloom. Narrative-driven, inspiring, and results-focused. Anonymized client stories that demonstrate real impact.`,
        contentGuidance: 'Write a client success story post. Structure: Problem (what the client struggled with). Solution (how Creatio + Bitloom helped, keep generic). Result (specific % improvements, time saved). Lesson (key takeaway). 200-350 words. Human and inspiring. 2-3 hashtags.',
      },
      announcement: {
        id: 'announcement',
        label: 'Announcement',
        color: '#8B5CF6', bgColor: 'bg-violet-100', textColor: 'text-violet-700',
        defaultTopic: 'Bitloom expands Creatio services to new BFSI segments',
        systemPrompt: `You write Facebook announcements for Bitloom. Exciting, clear, and community-inviting. Make followers feel part of the Bitloom journey.`,
        contentGuidance: 'Write a company/service announcement post. Open with excitement (not "We are pleased to announce"). Share what\'s new, why it matters to the audience, and how to take action. 150-250 words. Friendly, enthusiastic. Invite comments/questions. 2-4 hashtags.',
      },
    },
  },

  // ── Threads ───────────────────────────────────────────────────
  threads: {
    id: 'threads',
    name: 'Threads',
    label: 'Threads',
    profileUrl: 'https://www.threads.net/',
    color: '#101010',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    maxChars: 500,
    idealChars: 300,
    contentNote: 'Conversational and authentic. Short, punchy, relatable.',
    hashtagRange: [0, 3],
    postTypes: {
      take: {
        id: 'take',
        label: 'Hot Take',
        color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-700',
        defaultTopic: 'Unpopular opinion about digital transformation in banking',
        systemPrompt: `You write Threads posts for Bitloom. Super conversational, authentic, and relatable. Like texting a smart friend who works in AI/CRM. Under 500 characters.`,
        contentGuidance: 'Write a bold, opinionated Threads post about AI, CRM, or BFSI. Under 450 chars. No corporate speak. Reads like a real person\'s genuine take. Can be slightly provocative to spark replies. Max 2 hashtags if needed.',
      },
      question: {
        id: 'question',
        label: 'Conversation Starter',
        color: '#0EA5E9', bgColor: 'bg-sky-100', textColor: 'text-sky-700',
        defaultTopic: 'What\'s the hardest part of getting your team to actually use a CRM?',
        systemPrompt: `You write Threads conversation starters for Bitloom. Genuine questions that make people want to reply. Human and curious, not corporate.`,
        contentGuidance: 'Write a question-format Threads post. 1-2 sentences of context, then one clear question. Under 400 chars. Casual and human. About AI, CRM, or work/tech in BFSI. No hashtags needed.',
      },
      mini_insight: {
        id: 'mini_insight',
        label: 'Mini Insight',
        color: '#8B5CF6', bgColor: 'bg-violet-100', textColor: 'text-violet-700',
        defaultTopic: 'One insight about why CRM projects really fail',
        systemPrompt: `You write short, insightful Threads posts for Bitloom. One sharp idea, clearly stated. Think: "thing I wish someone told me about CRM/AI/automation". Under 500 chars.`,
        contentGuidance: 'Write one sharp insight about CRM, AI automation, or BFSI tech. Format: bold observation + 1-2 sentence explanation of why it matters. Under 450 chars. Conversational, no jargon, no hashtags unless 1 feels natural.',
      },
      story_snippet: {
        id: 'story_snippet',
        label: 'Story Snippet',
        color: '#F97316', bgColor: 'bg-orange-100', textColor: 'text-orange-700',
        defaultTopic: 'The moment we knew Creatio was the right CRM for our clients',
        systemPrompt: `You write mini personal/company story posts for Bitloom on Threads. Authentic, warm, and brief. Make readers feel like insiders.`,
        contentGuidance: 'Write a short personal/company story snippet. Under 480 chars. 2-3 short sentences. Set up a relatable moment, share a real insight or outcome. Conversational. No hashtags. Reads like a genuine memory or reflection.',
      },
    },
  },

} as const;

export type Platform = (typeof PLATFORMS)[PlatformId];

// ── Schedule types ────────────────────────────────────────────────────────────

export type ScheduleFrequency = 'daily' | 'working_days' | 'weekends' | 'custom';

// Map of frequency key → active days (0=Sun … 6=Sat)
export const FREQUENCY_OPTIONS: Record<ScheduleFrequency, number[]> = {
  daily:        [0, 1, 2, 3, 4, 5, 6],
  working_days: [1, 2, 3, 4, 5],
  weekends:     [0, 6],
  custom:       [],
};

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getFrequencyDays(freq: ScheduleFrequency, customDays: number[] = []): number[] {
  return freq === 'custom' ? customDays : (FREQUENCY_OPTIONS[freq] ?? []);
}

export function isScheduleDueToday(freq: ScheduleFrequency, customDays: number[]): boolean {
  const today = new Date().getDay();
  return getFrequencyDays(freq, customDays).includes(today);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getPlatform(id: string): Platform {
  return PLATFORMS[id as PlatformId] ?? PLATFORMS.linkedin;
}

export function getPlatformPostTypes(platformId: string): PlatformPostType[] {
  const platform = PLATFORMS[platformId as PlatformId];
  if (!platform) return Object.values(PLATFORMS.linkedin.postTypes);
  return Object.values(platform.postTypes);
}

export function getPlatformPostType(platformId: string, postTypeId: string): PlatformPostType | null {
  const platform = PLATFORMS[platformId as PlatformId];
  if (!platform) return null;
  return platform.postTypes[postTypeId] ?? null;
}

// Compatibility: keep POST_TYPES pointing at LinkedIn for existing code
export const PLATFORM_IDS = Object.keys(PLATFORMS) as PlatformId[];
