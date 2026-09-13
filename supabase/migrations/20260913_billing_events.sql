create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'mock' check (provider in ('mock', 'stripe')),
  plan text not null check (plan in ('Starter', 'Pro')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'succeeded' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists billing_events_bot_id_idx on public.billing_events(bot_id, created_at desc);
alter table public.billing_events enable row level security;

drop policy if exists "workspace owner reads billing events" on public.billing_events;
create policy "workspace owner reads billing events" on public.billing_events
for select to authenticated using (
  user_id = auth.uid() and exists (
    select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id
    where bots.id = billing_events.bot_id and workspaces.owner_id = auth.uid()
  )
);

grant select on public.billing_events to authenticated;
