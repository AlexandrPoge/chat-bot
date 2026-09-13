# Supabase setup

The interactive demo works without an account or API charges. Supabase is the persistence layer for production: authenticated workspaces, source files, parsed chunks, and conversations. Signed-in uploads call `/api/knowledge`, which verifies the user's Supabase token before writing to Storage and Postgres.

1. Create a Supabase project and enable Email authentication.
2. Open **SQL Editor** and run every file in `migrations/` in filename order.
3. Copy `.env.example` to `.env.local` and set the project URL, publishable key, and server-only secret key.
4. Restart `npm run dev`.

The browser client deliberately receives only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `SUPABASE_SECRET_KEY` is for protected server routes that ingest documents, create embeddings, and call vector search. Never commit `.env.local` or put the secret key into browser code.

Files are private in the `knowledge-files` bucket. Uploads are stored under `<bot-id>/<document-id>/<filename>` so the storage policy can restrict each workspace to its own files. The browser never receives the server secret key.

Test checkout events are stored in `billing_events`. They contain only mock payment metadata; card fields never leave the browser and are never persisted.
