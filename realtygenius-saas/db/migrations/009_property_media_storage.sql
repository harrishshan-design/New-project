insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'property-media',
  'property-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "service_role_manage_property_media" on storage.objects;
create policy "service_role_manage_property_media"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'property-media')
  with check (bucket_id = 'property-media');
