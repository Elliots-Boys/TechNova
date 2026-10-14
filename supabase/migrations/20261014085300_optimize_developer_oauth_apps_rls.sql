drop policy if exists "Developers can view own OAuth apps"
  on public.developer_oauth_apps;

create policy "Developers can view own OAuth apps"
  on public.developer_oauth_apps
  for select
  to authenticated
  using ((select auth.uid()) = owner_user_id);
