# Helpwise

Helpwise is an embeddable, source-grounded AI support chatbot. Teams bring their product documentation, test the resulting bot in a private workspace, then add a lightweight chat widget to their website.

This project is an MVP for the Paralect Product Academy chatbot-builder assignment.

See [`docs/demo-guide.md`](docs/demo-guide.md) for the presentation script and screenshot checklist.

## Product scope

- A conversion-focused product landing page with pricing
- A workspace for creating and configuring support bots
- Document ingestion, pgvector search, and source-grounded AI chat
- An embeddable web widget
- A mock billing flow with plan-based feature gates and an auditable backend event log

## Assignment coverage

| Requirement | Where to verify it |
| --- | --- |
| Descriptive landing page and pricing | `/` — feature story, Starter/Pro pricing, and clear CTAs |
| Upload docs and turn them into a bot | `/dashboard` → **Knowledge** — PDF, DOCX, TXT, and Markdown extraction, private cloud storage, embeddings, and an active-source selector |
| ChatGPT-like in-app chat | `/dashboard` → **Conversations** — Test AI and Gemini-backed source-grounded answers |
| Embeddable customer widget | `/dashboard` → **Widget** → **Open test site** or `/demo.html` — a compact widget floats on a separate marketing page |
| Pricing and billing | Dashboard **Upgrade to Pro** — Stripe-style test checkout; the plan and `$39` mock event are stored in Supabase, while money never moves and card fields are never sent to the server |
| Supabase and authentication | `/login` — email/password, with an optional Google OAuth path when enabled in Supabase; authenticated source uploads are stored in private Storage and chunked in Postgres with a pgvector retrieval schema |
| Presentation deliverable | [`docs/demo-guide.md`](docs/demo-guide.md) — a three-minute walkthrough and screenshot checklist |

## Stack

- Next.js, TypeScript, Tailwind CSS
- Supabase: auth, Postgres with pgvector, and private object storage
- Gemini through a server-side API for live answers and `gemini-embedding-001` for 1,536-dimensional document retrieval
- Free Test AI fallback: unlimited local answers without an external API request or key
- PDF, DOCX, TXT, and Markdown extraction; uploaded source files and extracted chunks sync to Supabase

## Code map

Every TypeScript source file is kept below 120 lines. The entry components are intentionally thin and coordinate feature modules rather than contain business logic.

- `src/features/dashboard/`: dashboard pages, small reusable UI components, and isolated hooks for chat and document state.
- `src/features/widget/`: the embedded chat's UI parts and browser-storage subscriptions.
- `src/lib/knowledge/`: server-only ownership checks, storage upload, chunking, vector search, and chat persistence.
- `src/lib/test-assistant/`: deterministic fallback reply rules split by generic, product, and dental scenarios.
- `src/app/api/`: HTTP boundary only; keys and Supabase admin access never reach browser modules.

## Getting started

```bash
npm run dev
```

Open http://localhost:3000 in the browser and sign in. The dashboard exposes a `Gemini` mode for live, source-grounded replies and a free `Test AI` mode that never makes an external AI request. Copy `.env.example` to `.env.local` and add `GEMINI_API_KEY` to enable Gemini; the key is used only by `/api/chat` on the server. The secure upload API validates and extracts PDF, DOCX, TXT, and Markdown text before storing the private file and indexed chunks in Supabase.

For persistent data, run every Supabase migration in filename order and set the environment values described in [`supabase/README.md`](supabase/README.md). The migrations add RLS, private Storage, filtered pgvector search, durable chat throttling, publish controls, and `billing_events`, where a reviewer can inspect mock subscription amount, plan, status, and timestamp. Never commit real API keys or `.env.local`.

## Quality checks

```bash
npm run lint
npm run build
```

`npm run build` explicitly uses webpack because this environment runs Node through Rosetta and Turbopack cannot spawn its CSS worker reliably.
