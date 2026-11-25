-- TechNova Desktop optional cloud sync.
-- Each row belongs to one authenticated user; client access is constrained by RLS.
create table if not exists public.desktop_sync_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  app_key text not null check (app_key in ('workspaces','whiteboard','documents','spreadsheets','api','widgets','website','mail')),
  record_key text not null check (char_length(record_key) between 1 and 100),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, app_key, record_key),
  constraint desktop_sync_payload_size check (octet_length(payload::text) <= 1048576)
);

alter table public.desktop_sync_records enable row level security;
revoke all on table public.desktop_sync_records from anon;
grant select, insert, update, delete on table public.desktop_sync_records to authenticated;

create policy "Users can read their own desktop sync records"
on public.desktop_sync_records for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own desktop sync records"
on public.desktop_sync_records for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own desktop sync records"
on public.desktop_sync_records for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own desktop sync records"
on public.desktop_sync_records for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists desktop_sync_records_updated_at_idx
on public.desktop_sync_records (user_id, updated_at desc);
