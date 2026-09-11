# Supabase setup

The interactive demo works without an account or API charges. Supabase is the persistence layer for production: authenticated workspaces, bot settings, source files, parsed chunks, and conversations.

1. Create a Supabase project and enable Email authentication.
2. Open **SQL Editor**, paste and run `migrations/20260911_initial_schema.sql`.
3. Copy `.env.example` to `.env.local` and set the project URL, publishable key, and server-only secret key.
4. Restart `npm run dev`.

The browser client deliberately receives only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `SUPABASE_SECRET_KEY` is for protected server routes that ingest documents, create embeddings, and call vector search. Never commit `.env.local` or put the secret key into browser code.

Files are private in the `knowledge-files` bucket. Uploads are stored under `<bot-id>/<document-id>/<filename>` so the storage policy can restrict each workspace to its own files.
