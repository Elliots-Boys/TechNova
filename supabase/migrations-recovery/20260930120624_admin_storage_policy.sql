drop policy if exists technova_images_admin_insert on storage.objects;
create policy technova_images_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'technova-images' and exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

drop policy if exists technova_images_admin_delete on storage.objects;
create policy technova_images_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'technova-images' and exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

drop policy if exists technova_images_public_read on storage.objects;
create policy technova_images_public_read on storage.objects for select using (bucket_id = 'technova-images');
