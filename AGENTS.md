# PostPilot Agent Instructions

## Key Commands
- Install dependencies: `npm install`
- Development server: `npm run dev` (starts on http://localhost:3000)
- Production build: `npm run build`
- Run production: `npm run start`
- Linting: `npm run lint`

## Environment Variables (.env.local)
```env
ANTHROPIC_API_KEY=sk-ant-...        # Required: Claude API key
SERPAPI_KEY=...                      # Optional: enables live web research
WEBHOOK_SECRET=change-me-random      # Required: secures n8n webhook
NEXT_PUBLIC_APP_NAME=PostPilot       # App display name
```

## Architecture Notes
- Next.js 14 with App Router
- TypeScript for type safety
- SQLite database via `better-sqlite3` (auto-initialized)
- Database file: `data/posts.db` (auto-created)
- Core business logic in `lib/` directory
- API routes located in `app/api/`

## Important Implementation Details
- Database connections: Always use `getDb()` inside function bodies (lazy initialization)
- Migrations handled automatically with `PRAGMA table_info` checks
- AI generation pipeline:
  1. Research via SerpAPI
  2. Insight extraction with Claude
  3. Final draft with Claude using type/tone prompts
- Streaming uses Server-Sent Events (SSE)
- Generation endpoint: `POST /api/generate`
- n8n webhook endpoint: `POST /api/webhook` (secured with WEBHOOK_SECRET)
- Webhook is idempotent based on `n8n_run_id`

## Key Files
- `lib/db.ts`: Database initialization and migrations
- `lib/post-generator.ts`: Research → draft pipeline with streaming
- `lib/db-queries.ts`: All database operations
- `app/api/generate/route.ts`: Streaming generation endpoint
- `app/api/webhook/route.ts`: n8n integration endpoint