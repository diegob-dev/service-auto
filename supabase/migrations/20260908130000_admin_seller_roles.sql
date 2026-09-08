alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;

-- I profili legacy "viewer" restano disattivati e diventano venditori.
update public.admin_profiles
set role = 'seller', active = false, updated_at = now()
where role = 'viewer';

alter table public.admin_profiles
  add constraint admin_profiles_role_check check (role in ('admin', 'seller')),
  alter column role set default 'seller',
  alter column active set default false;

create or replace function private.can_manage_cars()
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
      and role in ('admin', 'seller')
      and active
  );
$$;

revoke execute on function private.can_manage_cars() from public;
grant execute on function private.can_manage_cars() to authenticated, service_role;

drop policy if exists "Published cars and all cars for admins" on public.cars;
drop policy if exists "Admins can insert cars" on public.cars;
drop policy if exists "Admins can update cars" on public.cars;
drop policy if exists "Admins can delete cars" on public.cars;

create policy "Published cars and all cars for staff"
on public.cars for select to authenticated
using (status = 'published' or (select private.can_manage_cars()));
create policy "Staff can insert cars"
on public.cars for insert to authenticated
with check ((select private.can_manage_cars()));
create policy "Staff can update cars"
on public.cars for update to authenticated
using ((select private.can_manage_cars())) with check ((select private.can_manage_cars()));
create policy "Staff can delete cars"
on public.cars for delete to authenticated
using ((select private.can_manage_cars()));

drop policy if exists "Published images and all images for admins" on public.car_images;
drop policy if exists "Admins can insert car images" on public.car_images;
drop policy if exists "Admins can update car images" on public.car_images;
drop policy if exists "Admins can delete car images" on public.car_images;

create policy "Published images and all images for staff"
on public.car_images for select to authenticated
using (
  exists (select 1 from public.cars where public.cars.id = car_images.car_id and public.cars.status = 'published')
  or (select private.can_manage_cars())
);
create policy "Staff can insert car images"
on public.car_images for insert to authenticated
with check ((select private.can_manage_cars()));
create policy "Staff can update car images"
on public.car_images for update to authenticated
using ((select private.can_manage_cars())) with check ((select private.can_manage_cars()));
create policy "Staff can delete car images"
on public.car_images for delete to authenticated
using ((select private.can_manage_cars()));

drop policy if exists "Admins can read car image objects" on storage.objects;
drop policy if exists "Admins can upload car image objects" on storage.objects;
drop policy if exists "Admins can update car image objects" on storage.objects;
drop policy if exists "Admins can delete car image objects" on storage.objects;

create policy "Staff can read car image objects"
on storage.objects for select to authenticated
using (bucket_id = 'car-image' and (select private.can_manage_cars()));
create policy "Staff can upload car image objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'car-image' and (select private.can_manage_cars()));
create policy "Staff can update car image objects"
on storage.objects for update to authenticated
using (bucket_id = 'car-image' and (select private.can_manage_cars()))
with check (bucket_id = 'car-image' and (select private.can_manage_cars()));
create policy "Staff can delete car image objects"
on storage.objects for delete to authenticated
using (bucket_id = 'car-image' and (select private.can_manage_cars()));

notify pgrst, 'reload schema';
