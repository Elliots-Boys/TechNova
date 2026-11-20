insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-files', 'user-files', false, 104857600, array[
  'image/*','application/pdf','text/plain','text/csv','application/json','application/zip',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'audio/*','video/*'
])
on conflict (id) do update set public=false, file_size_limit=104857600;

create policy "Users can view their own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can upload their own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can update their own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'user-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
