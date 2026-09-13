-- Read-only browser access and server-only helper functions.
alter table public.workspaces enable row level security;
alter table public.bots enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.chat_rate_limits enable row level security;

create policy "workspace owner reads workspace" on public.workspaces for select to authenticated using (owner_id = auth.uid());
create policy "workspace owner reads bots" on public.bots for select to authenticated using (exists (select 1 from public.workspaces where workspaces.id = bots.workspace_id and workspaces.owner_id = auth.uid()));
create policy "workspace owner reads documents" on public.documents for select to authenticated using (exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = documents.bot_id and workspaces.owner_id = auth.uid()));
create policy "workspace owner reads chunks" on public.document_chunks for select to authenticated using (exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = document_chunks.bot_id and workspaces.owner_id = auth.uid()));
create policy "workspace owner reads conversations" on public.conversations for select to authenticated using (exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = conversations.bot_id and workspaces.owner_id = auth.uid()));
create policy "workspace owner reads messages" on public.messages for select to authenticated using (exists (select 1 from public.conversations join public.bots on bots.id = conversations.bot_id join public.workspaces on workspaces.id = bots.workspace_id where conversations.id = messages.conversation_id and workspaces.owner_id = auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('knowledge-files', 'knowledge-files', false, 10485760, array['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

create policy "workspace owner reads knowledge files" on storage.objects for select to authenticated using (
  bucket_id = 'knowledge-files' and exists (
    select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id
    where bots.id::text = (storage.foldername(storage.objects.name))[1] and workspaces.owner_id = auth.uid()
  )
);

create or replace function public.match_document_chunks(
  query_embedding extensions.vector(1536), match_bot_id uuid,
  match_document_ids uuid[], match_count integer default 5
)
returns table (id uuid, document_id uuid, content text, similarity double precision)
language sql stable set search_path = public, extensions
as $$
  select chunks.id, chunks.document_id, chunks.content, 1 - (chunks.embedding <=> query_embedding)
  from public.document_chunks as chunks
  where chunks.bot_id = match_bot_id and chunks.document_id = any(match_document_ids) and chunks.embedding is not null
  order by chunks.embedding <=> query_embedding
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
grant execute on function public.match_document_chunks(extensions.vector, uuid, uuid[], integer) to service_role;
