drop policy if exists user_roles_admin_update on public.user_roles;
create policy user_roles_admin_update on public.user_roles for update using (exists (select 1 from public.user_roles me where me.user_id = auth.uid() and me.role = 'admin')) with check (exists (select 1 from public.user_roles me where me.user_id = auth.uid() and me.role = 'admin'));

drop policy if exists user_roles_admin_insert on public.user_roles;
create policy user_roles_admin_insert on public.user_roles for insert with check (exists (select 1 from public.user_roles me where me.user_id = auth.uid() and me.role = 'admin'));

drop policy if exists user_roles_admin_delete on public.user_roles;
create policy user_roles_admin_delete on public.user_roles for delete using (exists (select 1 from public.user_roles me where me.user_id = auth.uid() and me.role = 'admin'));

drop policy if exists contact_messages_admin_read on public.contact_messages;
create policy contact_messages_admin_read on public.contact_messages for select using (exists (select 1 from public.user_roles me where me.user_id = auth.uid() and me.role = 'admin'));

drop policy if exists contact_messages_admin_delete on public.contact_messages;
create policy contact_messages_admin_delete on public.contact_messages for delete using (exists (select 1 from public.user_roles me where me.user_id = auth.uid() and me.role = 'admin'));
