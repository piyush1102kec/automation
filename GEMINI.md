# PostPilot - GEMINI.md

## Project Overview
PostPilot is an enterprise-grade LinkedIn content automation platform designed for Bitloom. It leverages Next.js 14, Qwen2.5-Coder (via Ollama), and SerpAPI to research and generate high-quality LinkedIn posts. The system features a two-step AI pipeline: live research via SerpAPI followed by content generation using Qwen2.5-Coder-32B.

### Core Technologies
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: SQLite (via `better-sqlite3`)
- **AI**: Qwen2.5-Coder-32B (Local Ollama or OpenAI-compatible API)
- **Research**: SerpAPI
- **State/Streaming**: Server-Sent Events (SSE) for real-time generation

## Project Structure
- `app/`: Next.js App Router pages and API routes.
- `components/`: UI components organized by feature (generate, posts, layout, ui).
- `lib/`: Core business logic, including database queries, post generation pipeline, and cost calculators.
- `data/`: Location of the SQLite database (`posts.db`).
- `public/`: Static assets.

## Key Files & Logic
- `lib/db.ts`: SQLite singleton and migration logic. Lazy initialization via `getDb()`.
- `lib/post-generator.ts`: The core Research → Draft pipeline using OpenAI-compatible SDK and streaming.
- `lib/db-queries.ts`: All database interaction methods.
- `app/api/generate/route.ts`: Streaming endpoint for post generation.
- `app/api/webhook/route.ts`: Idempotent webhook for n8n integration.

## Development Workflows

### Setup & Commands
- **Install Dependencies**: `npm install`
- **Development Mode**: `npm run dev` (Starts on http://localhost:3000)
- **Production Build**: `npm run build`
- **Run Production**: `npm run start`
- **Linting**: `npm run lint`

### Environment Variables
Required variables in `.env.local`:
- `SERPAPI_KEY`: For live web research (optional but recommended).
- `WEBHOOK_SECRET`: To secure n8n inbound webhooks.
- `OLLAMA_BASE_URL`: (Optional) Defaults to http://localhost:11434/v1.

### Database Guidelines
- **Initialization**: Always use `getDb()` inside function bodies to ensure the database is initialized only when needed and in the correct environment (server-side).
- **Migrations**: Database schema updates are handled automatically in `lib/db.ts` using `PRAGMA table_info` checks.

### AI Generation Pipeline
1. **Research**: Build a search query based on the topic and fetch results via SerpAPI.
2. **Insight Extraction**: Use Qwen to summarize 3-5 key insights from search results.
3. **Drafting**: Use Qwen with specific system prompts (based on post type) and tone instructions to generate the final post.
4. **Streaming**: Results are streamed to the client using SSE. The final message includes a `__META__` JSON object with token usage and cost metrics.

## Design System
- **Sidebar**: Dark slate (`#0F172A`).
- **Accent**: LinkedIn blue (`#0A66C2`).
- **Typography**: Geist font family.
- **Icons**: Lucide React.

## Deployment & Integration
- PostPilot is designed to integrate with **n8n** for scheduled content delivery via the `/api/webhook` endpoint.
- Webhook calls are idempotent based on `n8n_run_id`.
