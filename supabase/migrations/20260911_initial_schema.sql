-- Helpwise persistent data model. Run this migration in the Supabase SQL Editor
-- or apply it with the Supabase CLI after linking your own project.

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

alter table public.workspaces enable row level security;
alter table public.bots enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.chat_rate_limits enable row level security;

create policy "workspace owner manages workspace" on public.workspaces for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "workspace owner manages bots" on public.bots for all to authenticated using (exists (select 1 from public.workspaces where workspaces.id = bots.workspace_id and workspaces.owner_id = auth.uid())) with check (exists (select 1 from public.workspaces where workspaces.id = bots.workspace_id and workspaces.owner_id = auth.uid()));
create policy "workspace owner manages documents" on public.documents for all to authenticated using (exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = documents.bot_id and workspaces.owner_id = auth.uid())) with check (exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = documents.bot_id and workspaces.owner_id = auth.uid()));
create policy "workspace owner manages chunks" on public.document_chunks for all to authenticated using (exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = document_chunks.bot_id and workspaces.owner_id = auth.uid())) with check (exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = document_chunks.bot_id and workspaces.owner_id = auth.uid()));
create policy "workspace owner reads conversations" on public.conversations for all to authenticated using (exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = conversations.bot_id and workspaces.owner_id = auth.uid())) with check (exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = conversations.bot_id and workspaces.owner_id = auth.uid()));
create policy "workspace owner reads messages" on public.messages for all to authenticated using (exists (select 1 from public.conversations join public.bots on bots.id = conversations.bot_id join public.workspaces on workspaces.id = bots.workspace_id where conversations.id = messages.conversation_id and workspaces.owner_id = auth.uid())) with check (exists (select 1 from public.conversations join public.bots on bots.id = conversations.bot_id join public.workspaces on workspaces.id = bots.workspace_id where conversations.id = messages.conversation_id and workspaces.owner_id = auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('knowledge-files', 'knowledge-files', false, 10485760, array['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

create policy "workspace owner manages knowledge files" on storage.objects for all to authenticated using (
  bucket_id = 'knowledge-files' and exists (
    select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id
    where bots.id::text = (storage.foldername(name))[1] and workspaces.owner_id = auth.uid()
  )
) with check (
  bucket_id = 'knowledge-files' and exists (
    select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id
    where bots.id::text = (storage.foldername(name))[1] and workspaces.owner_id = auth.uid()
  )
);

create or replace function public.match_document_chunks(
  query_embedding extensions.vector(1536),
  match_bot_id uuid,
  match_document_ids uuid[],
  match_count integer default 5
)
returns table (id uuid, document_id uuid, content text, similarity double precision)
language sql stable set search_path = public, extensions
as $$
  select document_chunks.id, document_chunks.document_id, document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from public.document_chunks
  where document_chunks.bot_id = match_bot_id
    and document_chunks.document_id = any(match_document_ids)
    and document_chunks.embedding is not null
  order by document_chunks.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 10);
$$;

create or replace function public.consume_chat_quota(request_key text, max_requests integer, window_seconds integer)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare current_count integer;
begin
  insert into public.chat_rate_limits as limits (rate_key, window_started_at, request_count)
  values (request_key, now(), 1)
  on conflict (rate_key) do update set
    window_started_at = case when limits.window_started_at <= now() - make_interval(secs => window_seconds) then now() else limits.window_started_at end,
    request_count = case when limits.window_started_at <= now() - make_interval(secs => window_seconds) then 1 else limits.request_count + 1 end
  returning request_count into current_count;
  return current_count <= max_requests;
end;
$$;

revoke all on function public.consume_chat_quota(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_chat_quota(text, integer, integer) to service_role;
grant execute on function public.match_document_chunks(extensions.vector, uuid, uuid[], integer) to authenticated, service_role;
