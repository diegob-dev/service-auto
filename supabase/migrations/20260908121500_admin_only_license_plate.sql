create table if not exists public.car_admin_details (
  car_id uuid primary key references public.cars(id) on delete cascade,
  license_plate text not null check (length(trim(license_plate)) > 0),
  updated_at timestamptz not null default now()
);

alter table public.car_admin_details enable row level security;

revoke all on public.car_admin_details from anon;
grant select, insert, update, delete on public.car_admin_details to authenticated;

create policy "Admins can read private car details"
on public.car_admin_details for select to authenticated
using ((select private.is_admin()));

create policy "Admins can insert private car details"
on public.car_admin_details for insert to authenticated
with check ((select private.is_admin()));

create policy "Admins can update private car details"
on public.car_admin_details for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Admins can delete private car details"
on public.car_admin_details for delete to authenticated
using ((select private.is_admin()));

notify pgrst, 'reload schema';
