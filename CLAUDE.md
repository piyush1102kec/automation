# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**PostPilot** is a LinkedIn content automation SaaS for Bitloom (a Creatio CRM consultancy in BFSI). It runs a two-step AI pipeline: live web research via SerpAPI → post drafting via Claude Sonnet 4.5, streamed in real-time to the user.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm start          # Run production server
npm run lint       # ESLint check
```

## Environment Variables (`.env.local`)

```env
ANTHROPIC_API_KEY=sk-ant-...       # Required
SERPAPI_KEY=...                     # Optional — research skipped gracefully if absent
WEBHOOK_SECRET=change-me-random     # Required — secures n8n webhook
NEXT_PUBLIC_APP_NAME=PostPilot      # Optional display name
```

## Architecture

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · SQLite (`better-sqlite3`) · Anthropic SDK · SerpAPI · SSE streaming

### Key directories

- `app/` — Pages and API routes (App Router)
- `app/api/` — All API endpoints (`generate`, `posts`, `news`, `settings`, `schedule`, `webhook`)
- `components/` — Feature-scoped UI components (`generate/`, `posts/`, `layout/`, `ui/`)
- `lib/` — Business logic (no UI concerns)
- `data/posts.db` — SQLite database (auto-created on first run)

### Core library files

| File | Purpose |
|---|---|
| `lib/db.ts` | SQLite singleton + auto-migrations via `PRAGMA table_info` |
| `lib/db-queries.ts` | All DB operations (posts, settings, news, schedules) |
| `lib/post-generator.ts` | Research → insight extraction → draft pipeline with SSE streaming |
| `lib/platforms.ts` | Platform definitions (LinkedIn, Twitter, Instagram, Facebook, Threads) with per-platform post types, character limits, and system prompts |
| `lib/cost-calculator.ts` | Token cost math (`$3.00/1M input`, `$15.00/1M output` for Sonnet 4.5) |
| `lib/serp.ts` | SerpAPI search client |
| `lib/news-fetcher.ts` | Creatio scraper + Claude-generated BFSI insights |

### Generation pipeline (`lib/post-generator.ts`)

1. Build search query from topic + post type
2. Fetch results via SerpAPI
3. Claude extracts 3–5 key insights (max 800 tokens)
4. Claude drafts final post with type/tone-specific system prompt (max 1200 tokens)
5. Stream content via SSE to `app/api/generate/route.ts`
6. Final SSE chunk contains `__META__${JSON.stringify(meta)}` — the API route parses this, saves the post to DB, strips the marker before returning to client

### Database rules

- **Always call `getDb()` inside function bodies**, never at module scope — the DB is lazily initialized server-side only
- Schema migrations are automatic; add new columns with `PRAGMA table_info` guard before `ALTER TABLE` (see existing patterns in `lib/db.ts`)
- Key tables: `posts`, `news_cache`, `custom_post_types`, `post_type_overrides`, `custom_tones`, `topic_shortcuts`, `post_schedules`, `settings`

### n8n webhook (`app/api/webhook/route.ts`)

- Secured via `x-webhook-secret` header + `secret` body field matched against `WEBHOOK_SECRET`
- Idempotent: duplicate calls with same `n8n_run_id` are silently ignored

### Multi-platform content

Platform configs in `lib/platforms.ts` define per-platform post types with unique system prompts, character limits, and content guidance. Generation falls back to legacy LinkedIn post types in `lib/post-types.ts` if a platform-specific config is unavailable. Post type prompts can be overridden at runtime via Settings without code changes (stored in `post_type_overrides` table).

### News caching

- Creatio news: 6-hour TTL in `news_cache`
- BFSI insights (Claude-generated): 24-hour TTL in `news_cache`
- Static fallback content if both fetch and cache fail

## Path aliases

`@/*` maps to the repo root (configured in `tsconfig.json`).
