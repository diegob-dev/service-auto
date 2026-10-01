create or replace function public.staff_save_car(p_car jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved public.cars;
  normalized_plate text := nullif(upper(trim(p_car->>'license_plate')), '');
  saved_plate text;
  features text[] := coalesce(
    array(
      select trim(value)
      from jsonb_array_elements_text(coalesce(p_car->'optional_features', '[]'::jsonb)) as value
      where length(trim(value)) > 0
    ),
    '{}'::text[]
  );
begin
  if not (select private.can_manage_cars()) then
    raise exception 'Accesso non autorizzato' using errcode = '42501';
  end if;

  if nullif(p_car->>'id', '') is null then
    insert into public.cars (
      slug, brand, model, version, description, year, kilometers, price,
      fuel, transmission, color, power_cv, optional_features, status, featured
    ) values (
      p_car->>'slug', p_car->>'brand', p_car->>'model', nullif(p_car->>'version', ''),
      nullif(p_car->>'description', ''), (p_car->>'year')::integer,
      (p_car->>'kilometers')::integer, (p_car->>'price')::numeric,
      nullif(p_car->>'fuel', ''), nullif(p_car->>'transmission', ''),
      nullif(p_car->>'color', ''), (p_car->>'power_cv')::integer,
      features, p_car->>'status', coalesce((p_car->>'featured')::boolean, false)
    ) returning * into saved;
  else
    update public.cars set
      slug = p_car->>'slug',
      brand = p_car->>'brand',
      model = p_car->>'model',
      version = nullif(p_car->>'version', ''),
      description = nullif(p_car->>'description', ''),
      year = (p_car->>'year')::integer,
      kilometers = (p_car->>'kilometers')::integer,
      price = (p_car->>'price')::numeric,
      fuel = nullif(p_car->>'fuel', ''),
      transmission = nullif(p_car->>'transmission', ''),
      color = nullif(p_car->>'color', ''),
      power_cv = (p_car->>'power_cv')::integer,
      optional_features = features,
      status = p_car->>'status',
      featured = coalesce((p_car->>'featured')::boolean, false),
      updated_at = now()
    where id = (p_car->>'id')::uuid
    returning * into saved;

    if not found then
      raise exception 'Auto non trovata' using errcode = 'P0002';
    end if;
  end if;

  -- La targa rimane invisibile e non modificabile per i venditori.
  if (select private.is_admin()) then
    if normalized_plate is null then
      delete from public.car_admin_details where car_id = saved.id;
    else
      insert into public.car_admin_details (car_id, license_plate, updated_at)
      values (saved.id, normalized_plate, now())
      on conflict (car_id) do update
        set license_plate = excluded.license_plate, updated_at = excluded.updated_at;
    end if;
    saved_plate := normalized_plate;
  end if;

  return to_jsonb(saved) || jsonb_build_object('license_plate', saved_plate);
end;
$$;

revoke all on function public.staff_save_car(jsonb) from public, anon;
grant execute on function public.staff_save_car(jsonb) to authenticated;

create or replace function public.staff_set_car_cover(p_car_id uuid, p_image_id uuid)
returns public.car_images
language plpgsql
security invoker
set search_path = ''
as $$
declare
  selected_image public.car_images;
begin
  if not (select private.can_manage_cars()) then
    raise exception 'Accesso non autorizzato' using errcode = '42501';
  end if;

  select * into selected_image
  from public.car_images
  where id = p_image_id and car_id = p_car_id;

  if not found then
    raise exception 'Immagine non trovata' using errcode = 'P0002';
  end if;

  update public.car_images set is_cover = false
  where car_id = p_car_id and is_cover;

  update public.car_images set is_cover = true
  where id = p_image_id and car_id = p_car_id
  returning * into selected_image;

  return selected_image;
end;
$$;

revoke all on function public.staff_set_car_cover(uuid, uuid) from public, anon;
grant execute on function public.staff_set_car_cover(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
