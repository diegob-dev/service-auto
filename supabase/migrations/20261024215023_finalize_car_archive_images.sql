create function public.staff_save_car_with_archive(p_car jsonb, p_images jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  saved jsonb;
  image jsonb;
begin
  if not (select private.can_manage_cars()) then
    raise exception 'Accesso non autorizzato' using errcode = '42501';
  end if;
  if jsonb_typeof(p_images) <> 'array' then raise exception 'Selezione foto non valida'; end if;
  saved := public.staff_save_car(p_car);
  for image in select value from jsonb_array_elements(p_images) loop
    perform public.staff_attach_archive_image(
      (image->>'archive_id')::uuid, (saved->>'id')::uuid,
      image->>'storage_path', image->>'thumbnail_path'
    );
  end loop;
  return saved;
end;
$$;
revoke all on function public.staff_save_car_with_archive(jsonb, jsonb) from public, anon;
grant execute on function public.staff_save_car_with_archive(jsonb, jsonb) to authenticated;
notify pgrst, 'reload schema';
