# PostPilot — AI Content Engine + Automation Builder

A personal project by **Piyush Bhardwaj**. PostPilot started as a LinkedIn content automation tool for Bitloom (a Creatio CRM consultancy in BFSI) and has evolved into a broader vision: letting anyone describe an automation in plain English and get a working n8n workflow instantly — no code, no drag-and-drop.

> Looking for contributors and early users. If this resonates with you, open an issue or reach out.

---

## What It Does

**Two tools in one:**

1. **PostPilot** — AI-powered LinkedIn post generator. Give it a topic and tone, it searches the web for fresh insights, then streams a polished post back in real time.

2. **Automation Builder** — Describe any workflow in natural language ("send a Slack message every time a Google Sheet row is added"), and the AI generates a valid n8n workflow JSON that you can deploy to your n8n instance in one click.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI — inference | Groq API (LLaMA 3.3 70B) — free tier, ~1s response |
| AI — fallback | Ollama (local, any OpenAI-compat model) |
| Automation target | n8n (cloud or self-hosted) |
| Database | SQLite via `better-sqlite3` |
| Research | SerpAPI (web search for post grounding) |
| Styling | Tailwind CSS + Lucide React |

**AI cost: $0.** Groq's free tier handles the full load (14,400 req/day). Ollama is the local fallback — pull any model and it just works.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local`:

```env
# AI — pick one
GROQ_API_KEY=gsk_...                    # Free at console.groq.com — recommended
GROQ_MODEL=llama-3.3-70b-versatile     # Default if GROQ_API_KEY is set

# If using Ollama instead of Groq
OLLAMA_BASE_URL=http://localhost:11434  # Default
OLLAMA_MODEL=qwen2.5:7b                # Any model you've pulled

# Optional but recommended
SERPAPI_KEY=...                         # Web research for posts; skipped gracefully if absent

# Required
WEBHOOK_SECRET=change-me-random         # Secures the n8n inbound webhook
```

### 3. Run

```bash
npm run dev     # Dev server at http://localhost:3000
npm run build   # Production build
npm start       # Run production server
npm run lint    # ESLint
```

### 4. Configure n8n connection (for Automation Builder)

In the app at `/poc`, enter your n8n base URL and API key. These are stored in browser localStorage — nothing is sent to any server.

---

## Architecture

### Directory structure

```
app/
  api/
    generate/          # SSE streaming endpoint for post generation
    posts/             # CRUD for saved posts
    news/              # BFSI news feed
    settings/          # App settings
    webhook/           # Inbound n8n webhook (idempotent, secret-gated)
    poc/
      generate/        # Workflow generation from natural language
      push/            # Deploy workflow to n8n instance
      test-connection/ # Health check for n8n + AI provider
  poc/                 # Automation Builder UI
  generate/            # Post generator UI
  posts/               # Post library
  ...
components/
  poc/                 # Automation Builder components
  generate/            # Post generation components
  layout/              # Sidebar, shell
lib/
  post-generator.ts    # Research → insights → post draft pipeline
  workflow-generator.ts # Natural language → n8n workflow JSON pipeline
  n8n-client.ts        # n8n REST API client
  n8n-node-schemas.ts  # Pre-mapped schemas for 10 core n8n nodes
  news-fetcher.ts      # Creatio scraper + BFSI insights
  db.ts                # SQLite singleton + auto-migrations
  db-queries.ts        # All DB read/write operations
  platforms.ts         # Per-platform post types, char limits, system prompts
  serp.ts              # SerpAPI client
  cost-calculator.ts   # Token cost tracking
types/
  n8n.ts               # Full TypeScript types for n8n API
```

### Post generation pipeline (`lib/post-generator.ts`)

1. Build search query from topic + post type
2. Fetch top results via SerpAPI
3. AI extracts 3–5 key insights (800 token budget)
4. AI drafts final post with type/tone system prompt (1200 token budget), streamed via SSE
5. Final SSE chunk: `__META__{...json}` — parsed by the API route, saved to DB, stripped before reaching the client

### Workflow generation pipeline (`lib/workflow-generator.ts`)

1. Load schemas for 10 core n8n nodes into system prompt
2. Send user's natural-language prompt to AI at temperature 0.1
3. Strip `<think>` tokens (Qwen reasoning chains), extract JSON from fenced code blocks
4. Normalize workflow: assign node positions, validate structure
5. Derive human-readable `steps[]` summary from generated nodes
6. Return `{ workflow, steps, explanation }` to the client

### n8n client (`lib/n8n-client.ts`)

Typed REST client for the n8n Public API. Key detail: `POST /api/v1/workflows` rejects `active`, `id`, and `meta` fields — the client strips these before sending.

### AI provider fallback

Three files (`post-generator.ts`, `news-fetcher.ts`, `workflow-generator.ts`) use the same pattern:

```typescript
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const useGroq = !!GROQ_API_KEY;
// If GROQ_API_KEY is set → Groq; else → Ollama at OLLAMA_BASE_URL
```

### Database

SQLite, auto-created at `data/posts.db` on first run. Schema migrations run automatically via `PRAGMA table_info` guards — never manual. Always call `getDb()` inside function bodies (lazy init, server-side only).

Key tables: `posts`, `news_cache`, `custom_post_types`, `post_type_overrides`, `custom_tones`, `topic_shortcuts`, `post_schedules`, `settings`.

### n8n webhook (`app/api/webhook/route.ts`)

Secured via `x-webhook-secret` header matched against `WEBHOOK_SECRET` env var. Idempotent: duplicate calls with the same `n8n_run_id` are silently ignored.

---

## Roadmap

- [ ] **Action-based Builder UI** — render generated nodes as interactive cards, not just JSON
- [ ] **Bidirectional n8n sync** — pull existing workflows back into the editor
- [ ] **Self-healing workflows** — feed n8n execution errors back to the AI for automatic fixes
- [ ] **More platforms** — Twitter/X, Instagram, Threads post generation
- [ ] **Scheduled posting** — direct publish via platform APIs

---

## Contributing

This is a personal project — I'm not affiliated with any company. If you want to contribute, fix a bug, or just want to try it and give feedback, open an issue. All welcome.

---

## License

Dual-licensed — choose what fits your use case:

- **MIT** — personal use, contributors, open-source forks
- **AGPL v3** — commercial use or hosted services (requires you to open-source your version)

See [LICENSE](./LICENSE) for full terms.
