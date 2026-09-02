-- Area admin sicura per Service Auto. Eseguire nel SQL editor di Supabase.
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (length(trim(username)) >= 1),
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_sessions (
  token_hash text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.admin_sessions enable row level security;

insert into public.users (username, password_hash)
values ('user', crypt('', gen_salt('bf')))
on conflict (username) do nothing;

create or replace function public.is_admin_session(p_token uuid)
returns boolean language sql security definer set search_path = public, pg_temp stable as $$
  select exists (
    select 1 from public.admin_sessions s
    join public.users u on u.id = s.user_id
    where s.token_hash = encode(digest(p_token::text, 'sha256'), 'hex')
      and s.expires_at > now() and u.active
  );
$$;

create or replace function public.admin_login(p_username text, p_password text)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user public.users; v_token uuid := gen_random_uuid();
begin
  delete from public.admin_sessions where expires_at <= now();
  select * into v_user from public.users
  where username = trim(p_username) and active and password_hash = crypt(coalesce(p_password, ''), password_hash);
  if not found then raise exception 'Credenziali non valide'; end if;
  insert into public.admin_sessions(token_hash, user_id, expires_at)
  values (encode(digest(v_token::text, 'sha256'), 'hex'), v_user.id, now() + interval '8 hours');
  return v_token;
end; $$;

create or replace function public.admin_logout(p_token uuid)
returns void language sql security definer set search_path = public, pg_temp as $$
  delete from public.admin_sessions where token_hash = encode(digest(p_token::text, 'sha256'), 'hex');
$$;

create or replace function public.admin_list_cars(p_token uuid)
returns setof public.cars language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin_session(p_token) then raise exception 'Sessione scaduta o non valida'; end if;
  return query select * from public.cars order by created_at desc;
end; $$;

create or replace function public.admin_save_car(p_token uuid, p_car jsonb)
returns public.cars language plpgsql security definer set search_path = public, pg_temp as $$
declare v_result public.cars;
begin
  if not public.is_admin_session(p_token) then raise exception 'Sessione scaduta o non valida'; end if;
  if nullif(trim(p_car->>'brand'), '') is null or nullif(trim(p_car->>'model'), '') is null or nullif(trim(p_car->>'slug'), '') is null
    then raise exception 'Marca, modello e slug sono obbligatori'; end if;
  if p_car ? 'id' and nullif(p_car->>'id', '') is not null then
    update public.cars set
      slug=p_car->>'slug', brand=p_car->>'brand', model=p_car->>'model', version=nullif(p_car->>'version',''),
      description=nullif(p_car->>'description',''), year=(p_car->>'year')::int, kilometers=(p_car->>'kilometers')::int,
      price=(p_car->>'price')::numeric, fuel=nullif(p_car->>'fuel',''), transmission=nullif(p_car->>'transmission',''),
      color=nullif(p_car->>'color',''), power_cv=nullif(p_car->>'power_cv','')::int,
      status=(p_car->>'status')::text, featured=coalesce((p_car->>'featured')::boolean,false), updated_at=now()
    where id=(p_car->>'id')::uuid returning * into v_result;
    if not found then raise exception 'Auto non trovata'; end if;
  else
    insert into public.cars(slug,brand,model,version,description,year,kilometers,price,fuel,transmission,color,power_cv,status,featured)
    values (p_car->>'slug',p_car->>'brand',p_car->>'model',nullif(p_car->>'version',''),nullif(p_car->>'description',''),
      (p_car->>'year')::int,(p_car->>'kilometers')::int,(p_car->>'price')::numeric,nullif(p_car->>'fuel',''),
      nullif(p_car->>'transmission',''),nullif(p_car->>'color',''),nullif(p_car->>'power_cv','')::int,
      p_car->>'status',coalesce((p_car->>'featured')::boolean,false)) returning * into v_result;
  end if;
  return v_result;
end; $$;

create or replace function public.admin_delete_car(p_token uuid, p_car_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin_session(p_token) then raise exception 'Sessione scaduta o non valida'; end if;
  delete from public.cars where id=p_car_id;
end; $$;

create or replace function public.admin_list_users(p_token uuid)
returns table(id uuid, username text, active boolean, created_at timestamptz, updated_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin_session(p_token) then raise exception 'Sessione scaduta o non valida'; end if;
  return query select u.id,u.username,u.active,u.created_at,u.updated_at from public.users u order by u.username;
end; $$;

create or replace function public.admin_save_user(p_token uuid, p_user jsonb)
returns table(id uuid, username text, active boolean, created_at timestamptz, updated_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.is_admin_session(p_token) then raise exception 'Sessione scaduta o non valida'; end if;
  if nullif(trim(p_user->>'username'),'') is null then raise exception 'Username obbligatorio'; end if;
  if p_user ? 'id' and nullif(p_user->>'id','') is not null then
    update public.users set username=trim(p_user->>'username'), active=coalesce((p_user->>'active')::boolean,true),
      password_hash=case when coalesce(p_user->>'password','') <> '' then crypt(p_user->>'password',gen_salt('bf')) else password_hash end,
      updated_at=now() where public.users.id=(p_user->>'id')::uuid returning public.users.id into v_id;
  else
    insert into public.users(username,password_hash,active) values(trim(p_user->>'username'),crypt(coalesce(p_user->>'password',''),gen_salt('bf')),coalesce((p_user->>'active')::boolean,true)) returning public.users.id into v_id;
  end if;
  return query select u.id,u.username,u.active,u.created_at,u.updated_at from public.users u where u.id=v_id;
end; $$;

revoke all on public.users, public.admin_sessions from anon, authenticated;
revoke all on function public.is_admin_session(uuid) from public;
grant execute on function public.admin_login(text,text), public.admin_logout(uuid), public.admin_list_cars(uuid),
  public.admin_save_car(uuid,jsonb), public.admin_delete_car(uuid,uuid), public.admin_list_users(uuid),
  public.admin_save_user(uuid,jsonb) to anon, authenticated;
