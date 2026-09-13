-- Helpwise persistent tables. Apply migrations in filename order.

create extension if not exists vector with schema extensions;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  welcome_message text not null default 'Hi! How can I help?',
  accent_color text not null default '#D9FB97',
  plan text not null default 'Starter' check (plan in ('Starter', 'Pro')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  filename text not null,
  mime_type text,
  storage_path text not null unique,
  byte_size bigint not null check (byte_size >= 0),
  processing_status text not null default 'queued' check (processing_status in ('queued', 'processing', 'ready', 'failed')),
  extracted_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  bot_id uuid not null references public.bots(id) on delete cascade,
  content text not null,
  embedding extensions.vector(1536),
  chunk_index integer not null check (chunk_index >= 0),
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index if not exists document_chunks_bot_id_idx on public.document_chunks(bot_id);
create index if not exists document_chunks_embedding_idx on public.document_chunks using ivfflat (embedding extensions.vector_cosine_ops) with (lists = 100);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  source_document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0
);

create index if not exists conversations_bot_id_idx on public.conversations(bot_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
