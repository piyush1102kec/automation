import { getDb } from './db';
import type { PostType, PostStatus, PostSource, PostTone } from './post-types';

export interface Post {
  id: number;
  source: PostSource;
  post_type: PostType;
  topic: string | null;
  tone: PostTone;
  content: string;
  research: string | null;
  status: PostStatus;
  scheduled_for: string | null;
  posted_at: string | null;
  n8n_run_id: string | null;
  created_at: string;
  updated_at: string;
  input_tokens: number;
  output_tokens: number;
  generation_time_ms: number;
  total_cost_usd: number;
  model: string;
}

export interface ListPostsOptions {
  status?: PostStatus;
  source?: PostSource;
  post_type?: PostType;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export function listPosts(opts: ListPostsOptions = {}): { posts: Post[]; total: number } {
  const db = getDb();
  const { status, source, post_type, from, to, limit = 20, offset = 0 } = opts;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) { conditions.push('status = ?'); params.push(status); }
  if (source) { conditions.push('source = ?'); params.push(source); }
  if (post_type) { conditions.push('post_type = ?'); params.push(post_type); }
  if (from) { conditions.push('(scheduled_for >= ? OR created_at >= ?)'); params.push(from, from); }
  if (to) { conditions.push('(scheduled_for <= ? OR created_at <= ?)'); params.push(to, to); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM posts ${where}`).get(...params) as { c: number }).c;
  const posts = db.prepare(`
    SELECT * FROM posts ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as Post[];

  return { posts, total };
}

export function getPost(id: number): Post | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post | undefined) ?? null;
}

export function createPost(data: {
  source: PostSource;
  post_type: PostType;
  topic?: string;
  tone?: PostTone;
  content: string;
  research?: string;
  status?: PostStatus;
  scheduled_for?: string;
  n8n_run_id?: string;
  input_tokens?: number;
  output_tokens?: number;
  generation_time_ms?: number;
  total_cost_usd?: number;
  model?: string;
}): Post {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO posts (source, post_type, topic, tone, content, research, status, scheduled_for, n8n_run_id,
                       input_tokens, output_tokens, generation_time_ms, total_cost_usd, model)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.source,
    data.post_type,
    data.topic ?? null,
    data.tone ?? 'professional',
    data.content,
    data.research ?? null,
    data.status ?? 'draft',
    data.scheduled_for ?? null,
    data.n8n_run_id ?? null,
    data.input_tokens ?? 0,
    data.output_tokens ?? 0,
    data.generation_time_ms ?? 0,
    data.total_cost_usd ?? 0,
    data.model ?? 'claude-sonnet-4-5',
  );
  return getPost(result.lastInsertRowid as number)!;
}

export function updatePost(id: number, data: {
  content?: string;
  status?: PostStatus;
  posted_at?: string;
  topic?: string;
  tone?: PostTone;
}): Post | null {
  const db = getDb();
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.content !== undefined) { fields.push('content = ?'); params.push(data.content); }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
  if (data.posted_at !== undefined) { fields.push('posted_at = ?'); params.push(data.posted_at); }
  if (data.topic !== undefined) { fields.push('topic = ?'); params.push(data.topic); }
  if (data.tone !== undefined) { fields.push('tone = ?'); params.push(data.tone); }

  if (fields.length === 0) return getPost(id);

  params.push(id);
  db.prepare(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return getPost(id);
}

export function deletePost(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  return result.changes > 0;
}

export function upsertFromWebhook(data: {
  n8n_run_id: string;
  post_type: PostType;
  topic?: string;
  content: string;
  research?: string;
  scheduled_for?: string;
}): { post: Post; duplicate: boolean } {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM posts WHERE n8n_run_id = ?').get(data.n8n_run_id) as Post | undefined;
  if (existing) return { post: existing, duplicate: true };

  const post = createPost({ source: 'scheduled', status: 'scheduled', ...data });
  return { post, duplicate: false };
}

export function getStats(): { draft: number; scheduled: number; posted: number; total: number } {
  const db = getDb();
  const rows = db.prepare(`
    SELECT status, COUNT(*) as count FROM posts GROUP BY status
  `).all() as { status: string; count: number }[];

  const map = Object.fromEntries(rows.map(r => [r.status, r.count]));
  return {
    draft: map.draft ?? 0,
    scheduled: map.scheduled ?? 0,
    posted: map.posted ?? 0,
    total: rows.reduce((s, r) => s + r.count, 0),
  };
}

// ── Usage / Cost analytics ──────────────────────────────────────────────────

export interface UsageStats {
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
  avg_generation_time_ms: number;
  total_generations: number;
  avg_cost_per_post: number;
}

export function getUsageStats(): UsageStats {
  const db = getDb();
  const row = db.prepare(`
    SELECT
      COALESCE(SUM(input_tokens), 0)      AS total_input_tokens,
      COALESCE(SUM(output_tokens), 0)     AS total_output_tokens,
      COALESCE(SUM(total_cost_usd), 0)    AS total_cost_usd,
      COALESCE(AVG(NULLIF(generation_time_ms, 0)), 0) AS avg_generation_time_ms,
      COUNT(*)                             AS total_generations
    FROM posts
    WHERE source = 'manual'
  `).get() as UsageStats & { total_generations: number };

  return {
    ...row,
    avg_cost_per_post: row.total_generations > 0 ? row.total_cost_usd / row.total_generations : 0,
  };
}

export interface DailyUsage {
  date: string;
  posts: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
}

export function getDailyUsage(days = 7): DailyUsage[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      DATE(created_at)                   AS date,
      COUNT(*)                           AS posts,
      COALESCE(SUM(input_tokens), 0)     AS input_tokens,
      COALESCE(SUM(output_tokens), 0)    AS output_tokens,
      COALESCE(SUM(total_cost_usd), 0)   AS cost_usd
    FROM posts
    WHERE created_at >= DATE('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all() as DailyUsage[];

  // Fill missing days with zero
  const today = new Date();
  const result: DailyUsage[] = [];
  const existing = new Map(rows.map(r => [r.date, r]));

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push(existing.get(key) ?? { date: key, posts: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 });
  }
  return result;
}

export interface PostTypeStats {
  post_type: string;
  count: number;
  total_cost_usd: number;
  total_tokens: number;
}

export function getPostTypeStats(): PostTypeStats[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      post_type,
      COUNT(*) AS count,
      COALESCE(SUM(total_cost_usd), 0)                     AS total_cost_usd,
      COALESCE(SUM(input_tokens + output_tokens), 0)        AS total_tokens
    FROM posts
    GROUP BY post_type
    ORDER BY count DESC
  `).all() as PostTypeStats[];
}

export function getTopExpensivePosts(n = 5): Post[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM posts
    WHERE total_cost_usd > 0
    ORDER BY total_cost_usd DESC
    LIMIT ?
  `).all(n) as Post[];
}

// ── News cache ──────────────────────────────────────────────────────────────

export interface NewsItem {
  id: number;
  source: 'creatio' | 'bfsi';
  title: string;
  summary: string | null;
  url: string | null;
  published_at: string | null;
  fetched_at: string;
}

export function getNewsBySource(source: 'creatio' | 'bfsi', limit = 10): NewsItem[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM news_cache
    WHERE source = ?
    ORDER BY fetched_at DESC
    LIMIT ?
  `).all(source, limit) as NewsItem[];
}

export function getNewsAge(source: 'creatio' | 'bfsi'): number {
  const db = getDb();
  const row = db.prepare(`
    SELECT MAX(fetched_at) AS latest FROM news_cache WHERE source = ?
  `).get(source) as { latest: string | null };
  if (!row?.latest) return Infinity;
  return Date.now() - new Date(row.latest).getTime();
}

export function clearAndInsertNews(source: 'creatio' | 'bfsi', items: Omit<NewsItem, 'id' | 'fetched_at'>[]): void {
  const db = getDb();
  db.prepare(`DELETE FROM news_cache WHERE source = ?`).run(source);
  const stmt = db.prepare(`
    INSERT INTO news_cache (source, title, summary, url, published_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    stmt.run(source, item.title, item.summary ?? null, item.url ?? null, item.published_at ?? null);
  }
}

// ── Custom post types ───────────────────────────────────────────────────────

export interface CustomPostType {
  id: string;
  label: string;
  color: string;
  bg_color: string;
  text_color: string;
  days: string; // JSON array
  default_topic: string | null;
  system_prompt: string;
  content_guidance: string;
  is_active: number;
  created_at: string;
}

export function listCustomPostTypes(): CustomPostType[] {
  return getDb().prepare(`SELECT * FROM custom_post_types ORDER BY created_at DESC`).all() as CustomPostType[];
}

export function upsertCustomPostType(data: Omit<CustomPostType, 'created_at'>): void {
  getDb().prepare(`
    INSERT INTO custom_post_types (id, label, color, bg_color, text_color, days, default_topic, system_prompt, content_guidance, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      label=excluded.label, color=excluded.color, bg_color=excluded.bg_color,
      text_color=excluded.text_color, days=excluded.days, default_topic=excluded.default_topic,
      system_prompt=excluded.system_prompt, content_guidance=excluded.content_guidance,
      is_active=excluded.is_active
  `).run(data.id, data.label, data.color, data.bg_color, data.text_color, data.days,
    data.default_topic ?? null, data.system_prompt, data.content_guidance, data.is_active);
}

export function deleteCustomPostType(id: string): void {
  getDb().prepare(`DELETE FROM custom_post_types WHERE id = ?`).run(id);
}

// ── Post type overrides ─────────────────────────────────────────────────────

export interface PostTypeOverride {
  post_type_key: string;
  default_topic: string | null;
  system_prompt: string | null;
  content_guidance: string | null;
}

export function getPostTypeOverride(key: string): PostTypeOverride | null {
  return (getDb().prepare(`SELECT * FROM post_type_overrides WHERE post_type_key = ?`).get(key) as PostTypeOverride | undefined) ?? null;
}

export function listPostTypeOverrides(): PostTypeOverride[] {
  return getDb().prepare(`SELECT * FROM post_type_overrides`).all() as PostTypeOverride[];
}

export function upsertPostTypeOverride(data: PostTypeOverride): void {
  getDb().prepare(`
    INSERT INTO post_type_overrides (post_type_key, default_topic, system_prompt, content_guidance, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(post_type_key) DO UPDATE SET
      default_topic=excluded.default_topic,
      system_prompt=excluded.system_prompt,
      content_guidance=excluded.content_guidance,
      updated_at=excluded.updated_at
  `).run(data.post_type_key, data.default_topic ?? null, data.system_prompt ?? null, data.content_guidance ?? null);
}

// ── Custom tones ────────────────────────────────────────────────────────────

export interface CustomTone {
  id: string;
  label: string;
  instruction: string;
  is_active: number;
  created_at: string;
}

export function listCustomTones(): CustomTone[] {
  return getDb().prepare(`SELECT * FROM custom_tones WHERE is_active = 1 ORDER BY created_at DESC`).all() as CustomTone[];
}

export function upsertCustomTone(data: Omit<CustomTone, 'created_at'>): void {
  getDb().prepare(`
    INSERT INTO custom_tones (id, label, instruction, is_active)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET label=excluded.label, instruction=excluded.instruction, is_active=excluded.is_active
  `).run(data.id, data.label, data.instruction, data.is_active);
}

export function deleteCustomTone(id: string): void {
  getDb().prepare(`DELETE FROM custom_tones WHERE id = ?`).run(id);
}

// ── Topic shortcuts ─────────────────────────────────────────────────────────

export interface TopicShortcut {
  id: number;
  post_type: string;
  topic: string;
  created_at: string;
}

export function listTopicShortcuts(postType?: string): TopicShortcut[] {
  const db = getDb();
  if (postType) {
    return db.prepare(`SELECT * FROM topic_shortcuts WHERE post_type = ? ORDER BY created_at DESC`).all(postType) as TopicShortcut[];
  }
  return db.prepare(`SELECT * FROM topic_shortcuts ORDER BY post_type, created_at DESC`).all() as TopicShortcut[];
}

export function addTopicShortcut(postType: string, topic: string): void {
  getDb().prepare(`INSERT INTO topic_shortcuts (post_type, topic) VALUES (?, ?)`).run(postType, topic);
}

export function deleteTopicShortcut(id: number): void {
  getDb().prepare(`DELETE FROM topic_shortcuts WHERE id = ?`).run(id);
}
