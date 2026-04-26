# PostPilot — Enterprise LinkedIn Content Automation

> AI-powered LinkedIn post generation for Bitloom | Built on Next.js 14, Claude AI, and Creatio ecosystem intelligence

---

## Overview

PostPilot is an internal SaaS tool that automates LinkedIn content creation for **Bitloom** — a Creatio CRM implementation consultancy focused on the BFSI sector. It replaces a hardcoded n8n workflow with a full enterprise UI that any team member can use.

Every post goes through a two-step AI pipeline:
1. **Research** — SerpAPI fetches live web results relevant to the topic
2. **Draft** — Claude (Sonnet 4.5) generates a polished LinkedIn post using Bitloom's brand voice

All API usage is tracked: tokens consumed, time taken, and cost per post — visible on the dashboard and analytics page.

---

## Features

| Feature | Description |
|---|---|
| **Generate Post** | On-demand post generation with real-time streaming output |
| **Post Types** | 5 built-in types (Thought Leadership, Creatio Insight, Quiz, Employee POV, Story/BTS) + custom |
| **Tones** | Professional, Casual, Bold, Storytelling + user-created custom tones |
| **Token Tracking** | Input/output tokens, generation time, and USD cost recorded per post |
| **Analytics** | 14-day usage charts, cost by post type, top expensive posts |
| **News Intelligence** | Creatio news (scraped + cached) + AI-generated BFSI tech trends |
| **Settings** | CRUD for post types, tones, and topic shortcuts |
| **n8n Webhook** | Accepts scheduled posts from n8n automation pipeline |
| **Content Library** | Filter, edit, copy, and manage all posts |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v3 |
| Database | SQLite via `better-sqlite3` |
| AI | Anthropic Claude Sonnet 4.5 (`@anthropic-ai/sdk`) |
| Research | SerpAPI (Google search) |
| Streaming | SSE (Server-Sent Events) |

---

## Project Structure

```
automation/
├── app/
│   ├── page.tsx                  # Enterprise dashboard
│   ├── generate/page.tsx         # Post generation UI
│   ├── posts/page.tsx            # Content library
│   ├── scheduled/page.tsx        # n8n scheduled posts
│   ├── analytics/page.tsx        # API usage & cost analytics
│   ├── news/page.tsx             # Creatio + BFSI intelligence feed
│   ├── settings/page.tsx         # Post types, tones, topics CRUD
│   └── api/
│       ├── generate/route.ts     # Streaming generation endpoint
│       ├── posts/route.ts        # Post CRUD
│       ├── posts/[id]/route.ts   # Single post operations
│       ├── news/route.ts         # News fetch & cache
│       ├── settings/route.ts     # Settings CRUD
│       └── webhook/route.ts      # n8n inbound webhook
├── components/
│   ├── layout/Sidebar.tsx        # Dark enterprise sidebar
│   ├── generate/
│   │   ├── GenerateForm.tsx      # Post type + tone + topic picker
│   │   └── GenerateResult.tsx    # Result with token metrics
│   ├── posts/PostCard.tsx        # Expandable post card
│   └── ui/
│       ├── Badge.tsx             # Status & type badges
│       ├── Button.tsx            # Button component
│       └── CopyButton.tsx        # Clipboard copy
├── lib/
│   ├── db.ts                     # SQLite singleton + migrations
│   ├── db-queries.ts             # All DB operations
│   ├── post-generator.ts         # Research → draft pipeline (streaming)
│   ├── post-types.ts             # Post type config + tones
│   ├── cost-calculator.ts        # Token cost calculation + formatters
│   ├── news-fetcher.ts           # Creatio scraper + BFSI AI insights
│   ├── dashboard-data.ts         # Re-exports for dashboard pages
│   ├── serp.ts                   # SerpAPI search client
│   └── cn.ts                     # Tailwind class merger
├── data/
│   └── posts.db                  # SQLite database (auto-created)
└── .env.local                    # Environment variables
```

---

## Database Schema

### `posts`
Core table for all generated content.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `source` | TEXT | `manual` or `scheduled` |
| `post_type` | TEXT | One of the configured post types |
| `topic` | TEXT | User-provided topic/context |
| `tone` | TEXT | Tone used for generation |
| `content` | TEXT | Final post content |
| `research` | TEXT | JSON: SerpAPI results + AI summary |
| `status` | TEXT | `draft`, `scheduled`, `posted`, `skipped` |
| `scheduled_for` | TEXT | ISO date from n8n |
| `posted_at` | TEXT | When marked as posted |
| `n8n_run_id` | TEXT | Idempotency key from n8n |
| `input_tokens` | INTEGER | Total input tokens used |
| `output_tokens` | INTEGER | Total output tokens used |
| `generation_time_ms` | INTEGER | End-to-end generation time in ms |
| `total_cost_usd` | REAL | Computed API cost |
| `model` | TEXT | Claude model used |

### Additional Tables

| Table | Purpose |
|---|---|
| `news_cache` | Cached Creatio + BFSI news (6hr / 24hr TTL) |
| `custom_post_types` | User-created post formats |
| `post_type_overrides` | Prompt overrides for system post types |
| `custom_tones` | User-created tones with AI instructions |
| `topic_shortcuts` | Saved topics per post type |
| `settings` | Key-value app settings |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- A [SerpAPI key](https://serpapi.com/) *(optional — skipped gracefully if not set)*

### Installation

```bash
git clone <repo-url>
cd automation
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
ANTHROPIC_API_KEY=sk-ant-...        # Required: Claude API key
SERPAPI_KEY=...                      # Optional: enables live web research
WEBHOOK_SECRET=change-me-random      # Required: secures n8n webhook
NEXT_PUBLIC_APP_NAME=PostPilot       # App display name
```

### Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## API Reference

### `POST /api/generate`

Streams a generated LinkedIn post via SSE.

**Request body:**
```json
{
  "postType": "thought_leadership",
  "topic": "Why most SMBs underestimate CRM adoption costs",
  "tone": "professional"
}
```

**Stream events:**
```
data: {"type": "text", "text": "..."}
data: {"type": "done", "postId": 42, "meta": {...}}
data: {"type": "error", "error": "..."}
```

**Meta object (on `done`):**
```json
{
  "inputTokens": 812,
  "outputTokens": 287,
  "timeMs": 8420,
  "costUsd": 0.00675
}
```

---

### `POST /api/webhook`

Accepts automated posts from n8n. Idempotent — duplicate `n8n_run_id` values are silently ignored.

**Headers:** `x-webhook-secret: <WEBHOOK_SECRET>`

**Request body:**
```json
{
  "secret": "<WEBHOOK_SECRET>",
  "n8n_run_id": "run_20250426_001",
  "post_type": "creatio_insight",
  "topic": "How Creatio handles BFSI compliance workflows",
  "content": "Full post text...",
  "research": "Optional research summary",
  "scheduled_for": "2025-04-28"
}
```

---

### `GET /api/news?refresh=1`

Returns Creatio news and BFSI tech insights from cache. Pass `?refresh=1` to force a re-fetch (Creatio: scrapes website, BFSI: generates via Claude).

---

### `GET | POST | DELETE /api/settings`

Unified settings endpoint.

| Method | `resource` | Action |
|---|---|---|
| GET | `post-types` | List custom types + system overrides |
| GET | `tones` | List custom tones |
| GET | `topics&postType=quiz` | List topic shortcuts for a post type |
| POST | `post-types` | Create custom type or save system override |
| POST | `tones` | Create custom tone |
| POST | `topics` | Save topic shortcut |
| DELETE | `post-types&id=my_type` | Delete custom post type |
| DELETE | `tones&id=my_tone` | Delete custom tone |
| DELETE | `topics&id=5` | Delete topic shortcut |

---

## n8n Integration

In your existing n8n workflow, add an **HTTP Request** node at the end of your daily content run:

| Field | Value |
|---|---|
| Method | POST |
| URL | `http://your-server:3000/api/webhook` |
| Header | `x-webhook-secret: <WEBHOOK_SECRET>` |
| Body | JSON (see webhook spec above) |

The webhook is idempotent — safe to retry. Duplicate `n8n_run_id` values are ignored.

---

## API Pricing Reference

PostPilot uses `claude-sonnet-4-5` for all generation.

| Token type | Price |
|---|---|
| Input | $3.00 / 1M tokens |
| Output | $15.00 / 1M tokens |

A typical post (research + draft) costs approximately **$0.005 – $0.015**, depending on topic complexity and search results.

---

## Built-in Post Types

| Type | Scheduled Day | Purpose |
|---|---|---|
| Thought Leadership | Monday | Challenges CRM/AI assumptions. Generic, insight-driven. |
| Creatio Insight | Tuesday | How Creatio + AI transforms BFSI. Data-informed. |
| Quiz | Wednesday | Interactive quiz on AI/automation topics. |
| Employee POV | Thu, Sat, Sun | First-person team perspective. Authentic voice. |
| Story / BTS | Friday | Behind-the-scenes: team milestones, client wins. |

All built-in types can have their prompts overridden via **Settings → Post Types** without touching code. Fully custom post types can also be created and appear in the Generate form automatically.

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Sidebar bg | `#0F172A` | Dark slate sidebar |
| Brand blue | `#0A66C2` | LinkedIn blue — primary accent |
| Page bg | `#F1F5F9` | Content area background |
| Cards | `#FFFFFF` | All content cards |
| Success | `#10B981` | Published status |
| Warning | `#F59E0B` | Draft status, cost indicators |

---

## Developer Notes

- **DB init** — SQLite is lazily initialized via `getDb()`. Never call DB functions at module scope; always inside function bodies.
- **Migrations** — New columns are added with `PRAGMA table_info` guards before `ALTER TABLE`. Existing data is never touched on restart.
- **Streaming** — The generate endpoint yields SSE chunks. The final `__META__` marker carries token/cost data, is parsed in the API route, and stripped before the content is saved.
- **News caching** — Creatio news is scraped server-side with a 6-hour cache. BFSI insights are Claude-generated and cached for 24 hours. Both live in the `news_cache` table.
- **Custom tones in Generate form** — The form fetches `/api/settings?resource=tones` on mount and merges custom tones with system tones.

---

## License

Internal tool — Bitloom confidential. Not for external distribution.
