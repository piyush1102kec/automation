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
}

// Lazy singleton — only created on first call, not at module import time
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
