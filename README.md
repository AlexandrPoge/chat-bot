# Helpwise

Helpwise is an embeddable, source-grounded AI support chatbot. Teams bring their product documentation, test the resulting bot in a private workspace, then add a lightweight chat widget to their website.

This project is an MVP for the Paralect Product Academy chatbot-builder assignment.

See [`docs/demo-guide.md`](docs/demo-guide.md) for the presentation script and screenshot checklist.

## Product scope

- A conversion-focused product landing page with pricing
- A workspace for creating and configuring support bots
- Document ingestion, search, and source-cited AI chat
- An embeddable web widget
- A mock billing flow with plan-based feature gates

## Stack

- Next.js, TypeScript, Tailwind CSS
- Supabase: auth, Postgres with pgvector, and private object storage
- Gemini 3.6 Flash through the server-side Interactions API for source-grounded live answers
- Free Test AI fallback: unlimited local answers without an external API request or key
- PDF, DOCX, TXT, and Markdown extraction; uploaded source files and extracted chunks sync to Supabase

## Getting started

```bash
npm run dev
```

Open http://localhost:3000 in the browser. The dashboard and widget expose a `Gemini` mode for live, source-grounded replies and a free `Test AI` mode that never makes an external AI request. Copy `.env.example` to `.env.local` and add `GEMINI_API_KEY` to enable Gemini; the key is used only by `/api/chat` on the server. PDF, DOCX, TXT, and Markdown text is extracted in the browser before a signed-in upload is stored in Supabase.

For persistent data, run the Supabase migration and set the Supabase environment values described in [`supabase/README.md`](supabase/README.md). Never commit real API keys or `.env.local`.

## Quality checks

```bash
npm run lint
npm run build
```

`npm run build` explicitly uses webpack because this environment runs Node through Rosetta and Turbopack cannot spawn its CSS worker reliably.
