create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;
revoke all on public.admin_profiles from anon;
revoke insert, update, delete on public.admin_profiles from authenticated;
grant select on public.admin_profiles to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = (select auth.uid())
      and role = 'admin'
      and active
  );
$$;

revoke execute on function private.is_admin() from public;
grant usage on schema private to authenticated, service_role;
grant execute on function private.is_admin() to authenticated, service_role;

create or replace function private.sync_auth_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.admin_profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists sync_auth_profile on auth.users;
create trigger sync_auth_profile
after insert or update of email on auth.users
for each row execute function private.sync_auth_profile();

insert into public.admin_profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do update set email = excluded.email, updated_at = now();

drop policy if exists "Admins can read profiles" on public.admin_profiles;
create policy "Admins can read profiles"
on public.admin_profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "Published cars are publicly readable" on public.cars;
drop policy if exists "Published cars are readable by visitors" on public.cars;
drop policy if exists "Published cars and all cars for admins" on public.cars;
drop policy if exists "Admins can insert cars" on public.cars;
drop policy if exists "Admins can update cars" on public.cars;
drop policy if exists "Admins can delete cars" on public.cars;

create policy "Published cars are readable by visitors"
on public.cars for select to anon using (status = 'published');
create policy "Published cars and all cars for admins"
on public.cars for select to authenticated
using (status = 'published' or (select private.is_admin()));
create policy "Admins can insert cars"
on public.cars for insert to authenticated
with check ((select private.is_admin()));
create policy "Admins can update cars"
on public.cars for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete cars"
on public.cars for delete to authenticated
using ((select private.is_admin()));

revoke insert, update, delete on public.cars from anon;
grant select on public.cars to anon;
grant select, insert, update, delete on public.cars to authenticated;

drop policy if exists "Published car images are publicly readable" on public.car_images;
drop policy if exists "Published car images are readable by visitors" on public.car_images;
drop policy if exists "Published images and all images for admins" on public.car_images;
drop policy if exists "Admins can insert car images" on public.car_images;
drop policy if exists "Admins can update car images" on public.car_images;
drop policy if exists "Admins can delete car images" on public.car_images;

create policy "Published car images are readable by visitors"
on public.car_images for select to anon
using (exists (select 1 from public.cars where public.cars.id = car_images.car_id and public.cars.status = 'published'));
create policy "Published images and all images for admins"
on public.car_images for select to authenticated
using (
  exists (select 1 from public.cars where public.cars.id = car_images.car_id and public.cars.status = 'published')
  or (select private.is_admin())
);
create policy "Admins can insert car images"
on public.car_images for insert to authenticated
with check ((select private.is_admin()));
create policy "Admins can update car images"
on public.car_images for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete car images"
on public.car_images for delete to authenticated
using ((select private.is_admin()));

revoke insert, update, delete on public.car_images from anon;
grant select on public.car_images to anon;
grant select, insert, update, delete on public.car_images to authenticated;

drop policy if exists "Admins can read car image objects" on storage.objects;
drop policy if exists "Admins can upload car image objects" on storage.objects;
drop policy if exists "Admins can update car image objects" on storage.objects;
drop policy if exists "Admins can delete car image objects" on storage.objects;

create policy "Admins can read car image objects"
on storage.objects for select to authenticated
using (bucket_id = 'car-image' and (select private.is_admin()));
create policy "Admins can upload car image objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'car-image' and (select private.is_admin()));
create policy "Admins can update car image objects"
on storage.objects for update to authenticated
using (bucket_id = 'car-image' and (select private.is_admin()))
with check (bucket_id = 'car-image' and (select private.is_admin()));
create policy "Admins can delete car image objects"
on storage.objects for delete to authenticated
using (bucket_id = 'car-image' and (select private.is_admin()));

drop function if exists public.admin_login(text, text);
drop function if exists public.admin_logout(uuid);
drop function if exists public.admin_list_cars(uuid);
drop function if exists public.admin_list_car_images(uuid);
drop function if exists public.admin_save_car(uuid, jsonb);
drop function if exists public.admin_delete_car(uuid, uuid);
drop function if exists public.admin_list_users(uuid);
drop function if exists public.admin_save_user(uuid, jsonb);
drop function if exists public.is_admin_session(uuid);

drop table if exists public.admin_sessions;
drop table if exists public.users;
