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
}): Post {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO posts (source, post_type, topic, tone, content, research, status, scheduled_for, n8n_run_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  const post = createPost({
    source: 'scheduled',
    status: 'scheduled',
    ...data,
  });
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
