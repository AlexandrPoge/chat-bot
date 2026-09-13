-- Final browser boundary: sessions can read their workspace, but every mutation goes
-- through an authenticated server route that applies validation and plan limits.
drop policy if exists "workspace owner manages workspace" on public.workspaces;
drop policy if exists "workspace owner manages bots" on public.bots;
drop policy if exists "workspace owner manages documents" on public.documents;
drop policy if exists "workspace owner manages chunks" on public.document_chunks;
drop policy if exists "workspace owner reads workspace" on public.workspaces;
drop policy if exists "workspace owner reads bots" on public.bots;
drop policy if exists "workspace owner reads documents" on public.documents;
drop policy if exists "workspace owner reads chunks" on public.document_chunks;
drop policy if exists "workspace owner reads conversations" on public.conversations;
drop policy if exists "workspace owner reads messages" on public.messages;

create policy "workspace owner reads workspace" on public.workspaces for select to authenticated using (owner_id = auth.uid());
create policy "workspace owner reads bots" on public.bots for select to authenticated using (
  exists (select 1 from public.workspaces where workspaces.id = bots.workspace_id and workspaces.owner_id = auth.uid())
);
create policy "workspace owner reads documents" on public.documents for select to authenticated using (
  exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = documents.bot_id and workspaces.owner_id = auth.uid())
);
create policy "workspace owner reads chunks" on public.document_chunks for select to authenticated using (
  exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = document_chunks.bot_id and workspaces.owner_id = auth.uid())
);
create policy "workspace owner reads conversations" on public.conversations for select to authenticated using (
  exists (select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id where bots.id = conversations.bot_id and workspaces.owner_id = auth.uid())
);
create policy "workspace owner reads messages" on public.messages for select to authenticated using (
  exists (select 1 from public.conversations join public.bots on bots.id = conversations.bot_id join public.workspaces on workspaces.id = bots.workspace_id where conversations.id = messages.conversation_id and workspaces.owner_id = auth.uid())
);

drop policy if exists "workspace owner manages knowledge files" on storage.objects;
drop policy if exists "workspace owner reads knowledge files" on storage.objects;
create policy "workspace owner reads knowledge files" on storage.objects for select to authenticated using (
  bucket_id = 'knowledge-files' and exists (
    select 1 from public.bots join public.workspaces on workspaces.id = bots.workspace_id
    where bots.id::text = (storage.foldername(storage.objects.name))[1] and workspaces.owner_id = auth.uid()
  )
);

revoke execute on function public.match_document_chunks(extensions.vector, uuid, uuid[], integer) from authenticated;
