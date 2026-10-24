-- Private inbox; consumed rows remain as receipts against WhatsApp redelivery.
create table public.image_archive (
  id uuid primary key default gen_random_uuid(),
  source_message_id text not null unique,
  storage_path text not null unique,
  caption text not null default '',
  received_at timestamptz not null default now(),
  attached_at timestamptz,
  attached_car_id uuid references public.cars(id) on delete set null
);
create index image_archive_pending_idx on public.image_archive(received_at desc) where attached_at is null;
alter table public.image_archive enable row level security;
revoke all on public.image_archive from anon, authenticated;
grant select on public.image_archive to authenticated;
grant update(attached_at, attached_car_id) on public.image_archive to authenticated;
grant all on public.image_archive to service_role;
create policy "Staff read image archive" on public.image_archive for select to authenticated
using ((select private.can_manage_cars()));
create policy "Staff consume image archive" on public.image_archive for update to authenticated
using ((select private.can_manage_cars()) and attached_at is null)
with check ((select private.can_manage_cars()) and attached_at is not null and attached_car_id is not null);

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('image-archive', 'image-archive', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy "Staff read archived objects" on storage.objects for select to authenticated
using (bucket_id = 'image-archive' and (select private.can_manage_cars()));
create policy "Staff clean consumed archive objects" on storage.objects for delete to authenticated
using (bucket_id = 'image-archive' and (select private.can_manage_cars()) and exists (
  select 1 from public.image_archive a where a.storage_path = name and a.attached_at is not null
));

-- Serializes archive associations for this car and claims each receipt once.
create function public.staff_attach_archive_image(
  p_archive_id uuid, p_car_id uuid, p_storage_path text, p_thumbnail_path text default null
) returns public.car_images
language plpgsql security invoker set search_path = '' as $$
declare
  archived public.image_archive;
  inserted public.car_images;
begin
  if not (select private.can_manage_cars()) then
    raise exception 'Accesso non autorizzato' using errcode = '42501';
  end if;
  perform 1 from public.cars where id = p_car_id for update;
  if not found then raise exception 'Auto non trovata'; end if;
  select * into archived from public.image_archive where id = p_archive_id for update;
  if not found or archived.attached_at is not null then
    raise exception 'Foto già associata o non più disponibile';
  end if;
  if p_storage_path not like p_car_id::text || '/%' or
     (p_thumbnail_path is not null and p_thumbnail_path not like p_car_id::text || '/%') then
    raise exception 'Percorso immagine non valido';
  end if;
  if not exists (select 1 from storage.objects where bucket_id = 'car-image' and name = p_storage_path) then
    raise exception 'File immagine mancante';
  end if;
  insert into public.car_images(car_id, storage_path, thumbnail_path, alt, position, is_cover)
  select p_car_id, p_storage_path, p_thumbnail_path, archived.caption,
    coalesce(max(position), -1) + 1, not coalesce(bool_or(is_cover), false)
  from public.car_images where car_id = p_car_id
  returning * into inserted;
  update public.image_archive set attached_at = now(), attached_car_id = p_car_id where id = p_archive_id;
  return inserted;
end;
$$;
revoke all on function public.staff_attach_archive_image(uuid, uuid, text, text) from public, anon;
grant execute on function public.staff_attach_archive_image(uuid, uuid, text, text) to authenticated;
notify pgrst, 'reload schema';
