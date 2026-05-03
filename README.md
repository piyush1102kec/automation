# PostPilot — Enterprise LinkedIn Content Automation + n8n Automation Builder

> AI-powered LinkedIn post generation and n8n workflow automation for Bitloom | Built on Next.js 14, Groq (LLaMA), and Creatio ecosystem intelligence

---

## Overview

PostPilot is an internal SaaS tool for **Bitloom** — a Creatio CRM implementation consultancy focused on the BFSI sector. It has two core capabilities:

1. **LinkedIn Content Generation** — Research → AI-drafted posts, streamed in real-time
2. **Automation Builder (POC)** — Describe any automation in plain English → AI generates an n8n workflow → deploys it to your n8n instance instantly

Both pipelines are powered by open-source LLMs via **Groq** (free cloud inference, ~1s response time) with a local Ollama fallback.

---

## Features

| Feature | Description |
|---|---|
| **Generate Post** | Real-time streaming post generation with web research |
| **Automation Builder** | Plain-English → n8n workflow JSON → deploy to n8n in one click |
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
| AI (posts) | Groq API — `llama-3.3-70b-versatile` (open-source) |
| AI (workflows) | Groq API — `llama-3.3-70b-versatile` (open-source) |
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
│       ├── generate/route.ts         # Streaming post generation
│       ├── posts/route.ts            # Post CRUD
│       ├── news/route.ts             # News fetch & cache
│       ├── settings/route.ts         # Settings CRUD
│       ├── webhook/route.ts          # n8n inbound webhook
│       └── poc/
│           ├── generate/route.ts     # Workflow generation endpoint
│           ├── push/route.ts         # Deploy workflow to n8n
│           └── test-connection/route.ts  # Test n8n + AI connectivity
├── components/
│   ├── layout/Sidebar.tsx
│   ├── generate/
│   ├── posts/
│   ├── poc/                          # Automation Builder components
│   │   ├── N8nConnectionSetup.tsx    # n8n connection config card
│   │   ├── PromptInput.tsx           # Natural language prompt input
│   │   ├── WorkflowSteps.tsx         # Generated workflow step visualizer
│   │   ├── WorkflowJsonPreview.tsx   # Collapsible raw JSON panel
│   │   └── PushButton.tsx            # Deploy to n8n button
│   └── ui/
├── lib/
│   ├── db.ts                         # SQLite singleton + migrations
│   ├── db-queries.ts                 # All DB operations
│   ├── post-generator.ts             # Research → draft pipeline (streaming)
│   ├── workflow-generator.ts         # Prompt → n8n workflow JSON (Groq/Ollama)
│   ├── n8n-client.ts                 # n8n REST API client
│   ├── n8n-node-schemas.ts           # Schema library for 10 core n8n nodes
│   ├── post-types.ts                 # Post type config + tones
│   ├── platforms.ts                  # Multi-platform content configs
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
- [Groq API key](https://console.groq.com) — free, takes 2 minutes
- A running n8n instance (self-hosted or cloud) for the Automation Builder
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
# ── PostPilot ─────────────────────────────────────────────────────────────────
SERPAPI_KEY=...                      # Optional: enables live web research
WEBHOOK_SECRET=change-me-random      # Secures n8n inbound webhook
NEXT_PUBLIC_APP_NAME=PostPilot

# ── AI Provider (Groq — free, fast, open-source models) ──────────────────────
# Get your key at: https://console.groq.com → API Keys
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# ── n8n connection (for Automation Builder) ───────────────────────────────────
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=<your-n8n-api-key>

# ── Ollama (optional local fallback — requires GPU for acceptable speed) ──────
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

> **Groq vs Ollama**: If `GROQ_API_KEY` is set, Groq is used for both post generation and workflow generation. Ollama is only used as a fallback. Groq runs `llama-3.3-70b-versatile` (Meta's open-source LLaMA model) and responds in ~1s. Local Ollama requires a GPU — CPU-only inference takes 5+ minutes per request.

### n8n Setup (self-hosted)

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

Then open `http://localhost:5678` → Settings → API → Create API key.

### Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Automation Builder (`/poc`)

The Automation Builder lets you describe any automation in plain English and deploy it directly to n8n.

**How it works:**
1. Enter your n8n URL + API key in the connection panel
2. Describe what you want (e.g. *"Every Monday 9am, fetch AI news and email me a summary"*)
3. Groq (`llama-3.3-70b`) generates a valid n8n workflow JSON with correct node types
4. Review the generated steps and raw JSON
5. Click **Deploy to n8n** — the workflow appears in your n8n canvas instantly

**Supported node types:**
`scheduleTrigger`, `webhook`, `httpRequest`, `gmail`, `slack`, `googleSheets`, `openAi`, `if`, `set`, `code`

**Example prompts that work:**
- *"Every Monday at 9am, send me an email summary of AI news"*
- *"When a webhook is called, save the data to Google Sheets"*
- *"Every day at 8am, check our website is up and send a Slack alert if it's down"*
- *"When a new row is added to Google Sheets, send a welcome email via Gmail"*
- *"Every hour, fetch crypto prices from an API and post a summary to Slack"*

---

## API Reference

### `POST /api/generate`

Streams a generated LinkedIn post via SSE.

**Request body:**
```json
{
  "postType": "thought_leadership",
  "topic": "Why most SMBs underestimate CRM adoption costs",
  "tone": "professional",
  "platform": "linkedin"
}
```

**Stream events:**
```
data: {"type": "text", "text": "..."}
data: {"type": "done", "postId": 42, "meta": {...}}
data: {"type": "error", "error": "..."}
```

---

### `POST /api/poc/generate`

Generates an n8n workflow JSON from a plain-English prompt.

**Request:** `{ "prompt": "..." }`

**Response:**
```json
{
  "workflow": { "name": "...", "nodes": [...], "connections": {...} },
  "explanation": "One-sentence description",
  "steps": [{ "nodeType": "...", "nodeName": "...", "description": "..." }]
}
```

---

### `POST /api/poc/push`

Deploys a generated workflow to n8n.

**Request:**
```json
{
  "workflow": { ... },
  "connectionConfig": { "baseUrl": "http://localhost:5678", "apiKey": "..." }
}
```

**Response:** `{ "workflowId": "abc123", "workflowUrl": "http://localhost:5678/workflow/abc123", "activated": false }`

---

### `POST /api/poc/test-connection`

Tests connectivity to both n8n and the AI provider.

**Response:** `{ "connected": true, "workflowCount": 3, "ollama": { "ok": true, "model": "Groq · llama-3.3-70b-versatile" } }`

---

### `POST /api/webhook`

Accepts automated posts from n8n. Idempotent — duplicate `n8n_run_id` values are silently ignored.

**Headers:** `x-webhook-secret: <WEBHOOK_SECRET>`

---

## Developer Notes

- **DB init** — SQLite is lazily initialized via `getDb()`. Never call DB functions at module scope.
- **Migrations** — New columns use `PRAGMA table_info` guards before `ALTER TABLE`.
- **Streaming** — The generate endpoint yields SSE chunks. The final `__META__` marker carries token/cost data, parsed in the API route and stripped before saving.
- **AI provider priority** — `GROQ_API_KEY` takes precedence over Ollama in both `post-generator.ts` and `workflow-generator.ts`.
- **n8n create API** — The `active`, `id`, and `meta` fields are read-only in n8n's POST `/workflows` endpoint and are stripped before sending.

---

## License

Internal tool — Bitloom confidential. Not for external distribution.
