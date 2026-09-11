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
- Local Test AI: unlimited deterministic answers and PDF/TXT/Markdown text extraction, with no external API request
- Optional OpenAI server route: live answers when a key is configured

## Getting started

```bash
npm run dev
```

Open http://localhost:3000 in the browser. The dashboard and widget work in unlimited Test AI mode without credentials or API charges. PDF, TXT, and Markdown text is extracted locally in the browser for the test search. To enable live server-side AI answers, copy `.env.example` to `.env.local` and provide an `OPENAI_API_KEY`.

For persistent data, run the Supabase migration and set the Supabase environment values described in [`supabase/README.md`](supabase/README.md). Never commit real API keys or `.env.local`.

## Quality checks

```bash
npm run lint
npm run build
```

`npm run build` explicitly uses webpack because this environment runs Node through Rosetta and Turbopack cannot spawn its CSS worker reliably.
