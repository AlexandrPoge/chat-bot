# Helpwise

Helpwise is an embeddable, source-grounded AI support chatbot. Teams bring their product documentation, test the resulting bot in a private workspace, then add a lightweight chat widget to their website.

This project is an MVP for the Paralect Product Academy chatbot-builder assignment.

## Product scope

- A conversion-focused product landing page with pricing
- A workspace for creating and configuring support bots
- Document ingestion, search, and source-cited AI chat
- An embeddable web widget
- A mock billing flow with plan-based feature gates

## Stack

- Next.js, TypeScript, Tailwind CSS
- Supabase: auth, Postgres with pgvector, and object storage
- OpenAI: embeddings and answer generation

## Getting started

```bash
npm run dev
```

Open http://localhost:3000 in the browser. Copy `.env.example` to `.env.local` once backend integration is added. Never commit real API keys.

## Quality checks

```bash
npm run lint
npm run build
```

`npm run build` explicitly uses webpack because this environment runs Node through Rosetta and Turbopack cannot spawn its CSS worker reliably.
