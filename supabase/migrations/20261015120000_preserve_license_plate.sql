-- La targa viene modificata solo quando il client invia il campo license_plate.
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

  -- Si tocca la targa solo se il campo e' presente: una chiave assente la conserva,
  -- un valore vuoto o null la rimuove esplicitamente.
  if p_car ? 'license_plate' then
    if normalized_plate is null then
      delete from public.car_admin_details where car_id = saved.id;
    else
      insert into public.car_admin_details (car_id, license_plate, updated_at)
      values (saved.id, normalized_plate, now())
      on conflict (car_id) do update
        set license_plate = excluded.license_plate, updated_at = excluded.updated_at;
    end if;
    saved_plate := normalized_plate;
  else
    select license_plate into saved_plate
    from public.car_admin_details
    where car_id = saved.id;
  end if;

  return to_jsonb(saved) || jsonb_build_object('license_plate', saved_plate);
end;
$$;

notify pgrst, 'reload schema';
