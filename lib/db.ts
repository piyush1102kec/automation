import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'posts.db');

function createDb(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

function runMigrations(db: Database.Database) {
  // Core posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      source        TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'scheduled')),
      post_type     TEXT NOT NULL,
      topic         TEXT,
      tone          TEXT DEFAULT 'professional',
      content       TEXT NOT NULL,
      research      TEXT,
      status        TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'scheduled', 'posted', 'skipped')),
      scheduled_for TEXT,
      posted_at     TEXT,
      n8n_run_id    TEXT UNIQUE,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_posts_status        ON posts (status);
    CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON posts (scheduled_for);
    CREATE INDEX IF NOT EXISTS idx_posts_source        ON posts (source);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at    ON posts (created_at DESC);

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TRIGGER IF NOT EXISTS posts_updated_at
    AFTER UPDATE ON posts
    BEGIN
      UPDATE posts SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);

  // Migration: add token tracking columns to posts
  const postCols = (db.prepare(`PRAGMA table_info(posts)`).all() as { name: string }[]).map(c => c.name);
  if (!postCols.includes('input_tokens')) db.exec(`ALTER TABLE posts ADD COLUMN input_tokens INTEGER DEFAULT 0`);
  if (!postCols.includes('output_tokens')) db.exec(`ALTER TABLE posts ADD COLUMN output_tokens INTEGER DEFAULT 0`);
  if (!postCols.includes('generation_time_ms')) db.exec(`ALTER TABLE posts ADD COLUMN generation_time_ms INTEGER DEFAULT 0`);
  if (!postCols.includes('total_cost_usd')) db.exec(`ALTER TABLE posts ADD COLUMN total_cost_usd REAL DEFAULT 0`);
  if (!postCols.includes('model')) db.exec(`ALTER TABLE posts ADD COLUMN model TEXT DEFAULT 'claude-sonnet-4-5'`);

  // News cache table
  db.exec(`
    CREATE TABLE IF NOT EXISTS news_cache (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      source       TEXT NOT NULL CHECK (source IN ('creatio', 'bfsi')),
      title        TEXT NOT NULL,
      summary      TEXT,
      url          TEXT,
      published_at TEXT,
      fetched_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_news_source ON news_cache (source, fetched_at DESC);
  `);

  // Custom post types (user-created)
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_post_types (
      id               TEXT PRIMARY KEY,
      label            TEXT NOT NULL,
      color            TEXT NOT NULL DEFAULT '#6366F1',
      bg_color         TEXT NOT NULL DEFAULT 'bg-indigo-100',
      text_color       TEXT NOT NULL DEFAULT 'text-indigo-700',
      days             TEXT NOT NULL DEFAULT '[]',
      default_topic    TEXT,
      system_prompt    TEXT NOT NULL DEFAULT '',
      content_guidance TEXT NOT NULL DEFAULT '',
      is_active        INTEGER NOT NULL DEFAULT 1,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Overrides for system post types
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_type_overrides (
      post_type_key    TEXT PRIMARY KEY,
      default_topic    TEXT,
      system_prompt    TEXT,
      content_guidance TEXT,
      updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Custom tones
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_tones (
      id          TEXT PRIMARY KEY,
      label       TEXT NOT NULL,
      instruction TEXT NOT NULL,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Topic shortcuts (saved topics per post type)
  db.exec(`
    CREATE TABLE IF NOT EXISTS topic_shortcuts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      post_type  TEXT NOT NULL,
      topic      TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_topics_post_type ON topic_shortcuts (post_type);
  `);
}

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

export function getDb(): Database.Database {
  if (!global.__db) {
    global.__db = createDb();
  }
  return global.__db;
}
