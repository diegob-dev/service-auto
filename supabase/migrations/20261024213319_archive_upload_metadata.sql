alter table public.image_archive
  add column captured_at timestamp without time zone,
  add column original_name text;
grant insert(id, source_message_id, storage_path, caption, captured_at, original_name)
  on public.image_archive to authenticated;
create policy "Staff upload archive records" on public.image_archive for insert to authenticated
with check ((select private.can_manage_cars()) and attached_at is null and attached_car_id is null
  and source_message_id = 'upload:' || id::text
  and storage_path like id::text || '/%');
create policy "Staff upload archive objects" on storage.objects for insert to authenticated
with check (bucket_id = 'image-archive' and (select private.can_manage_cars()));
update storage.buckets set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif']
where id = 'image-archive';
notify pgrst, 'reload schema';
