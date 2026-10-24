alter table public.image_archive add column deleted_at timestamptz;
grant update(deleted_at) on public.image_archive to authenticated;
alter policy "Staff consume image archive" on public.image_archive
using ((select private.can_manage_cars()) and attached_at is null and deleted_at is null)
with check ((select private.can_manage_cars()) and attached_at is not null and attached_car_id is not null and deleted_at is null);
create policy "Staff discard archive records" on public.image_archive for update to authenticated
using ((select private.can_manage_cars()) and attached_at is null and deleted_at is null)
with check ((select private.can_manage_cars()) and attached_at is null and attached_car_id is null and deleted_at is not null);
create policy "Staff clean deleted archive objects" on storage.objects for delete to authenticated
using (bucket_id = 'image-archive' and (select private.can_manage_cars()) and exists (
  select 1 from public.image_archive a where a.storage_path = name and a.deleted_at is not null
));
create function public.staff_discard_archive_image(p_archive_id uuid)
returns text language plpgsql security invoker set search_path = '' as $$
declare path text;
begin
  if not (select private.can_manage_cars()) then raise exception 'Accesso non autorizzato' using errcode = '42501'; end if;
  update public.image_archive set deleted_at = now()
  where id = p_archive_id and attached_at is null and deleted_at is null
  returning storage_path into path;
  if not found then raise exception 'Foto già associata o non più disponibile'; end if;
  return path;
end;
$$;
revoke all on function public.staff_discard_archive_image(uuid) from public, anon;
grant execute on function public.staff_discard_archive_image(uuid) to authenticated;
notify pgrst, 'reload schema';
