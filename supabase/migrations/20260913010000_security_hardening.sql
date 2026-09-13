alter table public.bots
add column if not exists is_published boolean not null default false;

create or replace function public.guard_billing_managed_plan()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' and new.plan is distinct from old.plan then
    raise exception 'Plan changes must use the billing endpoint';
  end if;
  return new;
end;
$$;

drop trigger if exists billing_managed_plan on public.bots;
create trigger billing_managed_plan
before update of plan on public.bots
for each row execute function public.guard_billing_managed_plan();

create table if not exists public.chat_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0
);
alter table public.chat_rate_limits enable row level security;

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

drop function if exists public.match_document_chunks(extensions.vector, uuid, integer);
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
grant execute on function public.match_document_chunks(extensions.vector, uuid, uuid[], integer) to service_role;
