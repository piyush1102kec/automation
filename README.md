# PostPilot — Enterprise LinkedIn Content Automation + n8n Automation Builder

> AI-powered LinkedIn post generation and n8n workflow automation for Bitloom | Built on Next.js 14, Claude AI, and Creatio ecosystem intelligence

---

## Overview

PostPilot is an internal SaaS tool for **Bitloom** — a Creatio CRM implementation consultancy focused on the BFSI sector. It has two core capabilities:

1. **LinkedIn Content Generation** — Live web research → Claude Sonnet drafts polished posts, streamed in real-time
2. **Automation Builder** — Describe any automation in plain English → Groq (LLaMA) generates n8n workflow JSON → deployed to your n8n instance in one click

---

## Features

| Feature | Description |
|---|---|
| **Generate Post** | Real-time streaming post generation with web research (Claude Sonnet 4.5) |
| **Automation Builder** | Plain-English → n8n workflow JSON → deploy to n8n instantly |
| **Post Types** | 5 built-in types + custom types and tones |
| **Token Tracking** | Tokens, generation time, and USD cost per post |
| **Analytics** | 14-day usage charts, cost by post type |
| **News Intelligence** | Creatio news + AI-generated BFSI tech trends |
| **Settings** | CRUD for post types, tones, and topic shortcuts |
| **n8n Webhook** | Accept scheduled posts from n8n automations |
| **Content Library** | Filter, edit, copy, and manage all posts |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v3 |
| Database | SQLite via `better-sqlite3` |
| AI — post generation | Anthropic Claude Sonnet 4.5 |
| AI — workflow generation | Groq API — `llama-3.3-70b-versatile` (open-source, free) |
| Research | SerpAPI (Google search) |
| Streaming | SSE (Server-Sent Events) |
| Automation | n8n REST API (self-hosted or cloud) |

---

## Project Structure

```
automation/
├── app/
│   ├── page.tsx                      # Enterprise dashboard
│   ├── generate/page.tsx             # Post generation UI
│   ├── posts/page.tsx                # Content library
│   ├── analytics/page.tsx            # API usage & cost analytics
│   ├── news/page.tsx                 # Creatio + BFSI intelligence feed
│   ├── settings/page.tsx             # Post types, tones, topics CRUD
│   ├── poc/page.tsx                  # Automation Builder UI
│   └── api/
│       ├── generate/route.ts         # Streaming post generation (Claude)
│       ├── posts/route.ts            # Post CRUD
│       ├── news/route.ts             # News fetch & cache
│       ├── settings/route.ts         # Settings CRUD
│       ├── webhook/route.ts          # n8n inbound webhook
│       └── poc/
│           ├── generate/route.ts     # Workflow generation (Groq)
│           ├── push/route.ts         # Deploy workflow to n8n
│           └── test-connection/route.ts  # Test n8n + AI connectivity
├── components/
│   ├── layout/Sidebar.tsx
│   ├── generate/
│   ├── posts/
│   ├── poc/
│   │   ├── N8nConnectionSetup.tsx   # n8n connection config card
│   │   ├── PromptInput.tsx          # Natural language prompt input
│   │   ├── WorkflowSteps.tsx        # Generated workflow step visualizer
│   │   ├── WorkflowJsonPreview.tsx  # Collapsible raw JSON panel
│   │   └── PushButton.tsx           # Deploy to n8n button
│   └── ui/
├── lib/
│   ├── db.ts                         # SQLite singleton + migrations
│   ├── db-queries.ts                 # All DB operations
│   ├── post-generator.ts             # Research → Claude draft pipeline (SSE)
│   ├── workflow-generator.ts         # Prompt → n8n JSON (Groq/Ollama)
│   ├── n8n-client.ts                 # n8n REST API client
│   ├── n8n-node-schemas.ts           # Schema library for 10 core n8n nodes
│   ├── post-types.ts                 # Post type config + tones
│   ├── cost-calculator.ts            # Token cost calculation
│   ├── news-fetcher.ts               # Creatio scraper + BFSI AI insights
│   └── serp.ts                       # SerpAPI search client
├── types/
│   └── n8n.ts                        # TypeScript types for n8n API
└── data/
    └── posts.db                      # SQLite database (auto-created)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Anthropic API key](https://console.anthropic.com/) — for LinkedIn post generation
- [Groq API key](https://console.groq.com) — free, for n8n workflow generation
- A running n8n instance for the Automation Builder
- [SerpAPI key](https://serpapi.com/) *(optional — research skipped gracefully if absent)*

### Installation

```bash
git clone <repo-url>
cd automation
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
# ── PostPilot (LinkedIn post generation) ─────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...         # Required: Claude API key
SERPAPI_KEY=...                       # Optional: enables live web research
WEBHOOK_SECRET=change-me-random       # Secures n8n inbound webhook
NEXT_PUBLIC_APP_NAME=PostPilot

# ── Groq (Automation Builder — free, fast, open-source LLaMA) ────────────────
# Get your key at: https://console.groq.com → API Keys
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# ── n8n connection (for Automation Builder) ───────────────────────────────────
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=<your-n8n-api-key>

# ── Ollama (optional fallback — requires GPU for acceptable speed) ────────────
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

### n8n Setup (self-hosted)

```bash
docker run -d --name n8n -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

Open `http://localhost:5678` → Settings → API → Create API key.

### Run

```bash
npm run dev    # http://localhost:3000
npm run build  # Production build
npm start      # Run production server
npm run lint   # ESLint check
```

---

## Automation Builder (`/poc`)

Describe any automation → AI generates a valid n8n workflow → deploy in one click.

**How it works:**
1. Enter your n8n URL + API key in the connection panel (saved to localStorage)
2. Describe what you want (e.g. *"Every Monday 9am, fetch AI news and email a summary"*)
3. Groq (`llama-3.3-70b`) generates a valid n8n workflow JSON with correct node types
4. Review the generated steps and raw JSON
5. Click **Deploy to n8n** — the workflow appears in your n8n canvas instantly

**Supported node types:**
`scheduleTrigger`, `webhook`, `httpRequest`, `gmail`, `slack`, `googleSheets`, `openAi`, `if`, `set`, `code`

**Example prompts:**
- *"Every Monday at 9am, send me an email summary of AI news"*
- *"When a webhook is called, save the data to Google Sheets"*
- *"Every day at 8am, check our website is up and send a Slack alert if it's down"*
- *"When a new row is added to Google Sheets, send a welcome email via Gmail"*
- *"Every hour, fetch crypto prices from an API and post a summary to Slack"*

---

## API Reference

### `POST /api/generate`
Streams a generated LinkedIn post via SSE (Claude Sonnet 4.5).

**Request:** `{ "postType": "thought_leadership", "topic": "...", "tone": "professional" }`

**Events:** `data: {"type":"text","text":"..."}` · `data: {"type":"done","postId":42,"meta":{...}}`

---

### `POST /api/poc/generate`
Generates n8n workflow JSON from a plain-English prompt (Groq).

**Request:** `{ "prompt": "..." }`

**Response:** `{ "workflow": {...}, "explanation": "...", "steps": [...] }`

---

### `POST /api/poc/push`
Deploys a generated workflow to n8n.

**Request:** `{ "workflow": {...}, "connectionConfig": { "baseUrl": "...", "apiKey": "..." } }`

**Response:** `{ "workflowId": "abc123", "workflowUrl": "http://localhost:5678/workflow/abc123", "activated": false }`

---

### `POST /api/poc/test-connection`
Tests n8n connectivity and AI provider health.

**Response:** `{ "connected": true, "workflowCount": 3, "ollama": { "ok": true, "model": "Groq · llama-3.3-70b-versatile" } }`

---

### `POST /api/webhook`
Accepts automated posts from n8n. Idempotent — duplicate `n8n_run_id` values are silently ignored.

**Headers:** `x-webhook-secret: <WEBHOOK_SECRET>`

---

## Developer Notes

- **DB init** — SQLite is lazily initialized via `getDb()`. Never call DB functions at module scope.
- **Migrations** — New columns use `PRAGMA table_info` guards before `ALTER TABLE`.
- **Streaming** — The generate endpoint yields SSE chunks. The final `__META__` marker carries token/cost data, parsed and stripped before saving.
- **AI providers** — Post generation uses Anthropic Claude (set `ANTHROPIC_API_KEY`). Workflow generation uses Groq if `GROQ_API_KEY` is set, else falls back to Ollama.
- **n8n create API** — The `active`, `id`, and `meta` fields are read-only in n8n's `POST /workflows` and are stripped before sending.

---

## License

Internal tool — Bitloom confidential. Not for external distribution.
