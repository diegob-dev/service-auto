create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(trim(slug)) >= 1),
  brand text not null check (length(trim(brand)) >= 1),
  model text not null check (length(trim(model)) >= 1),
  version text,
  description text,
  year integer not null check (year between 1900 and 2100),
  kilometers integer not null default 0 check (kilometers >= 0),
  price numeric(12, 2) not null default 0 check (price >= 0),
  fuel text,
  transmission text,
  color text,
  power_cv integer check (power_cv is null or power_cv > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'sold')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.car_images (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  storage_path text not null unique,
  alt text not null default '',
  position integer not null default 0 check (position >= 0),
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists car_images_one_cover_per_car
  on public.car_images(car_id) where is_cover;
create index if not exists cars_public_listing_idx
  on public.cars(status, featured desc, created_at desc);
create index if not exists car_images_car_position_idx
  on public.car_images(car_id, position);

alter table public.cars enable row level security;
alter table public.car_images enable row level security;

drop policy if exists "Published cars are publicly readable" on public.cars;
create policy "Published cars are publicly readable"
  on public.cars for select to anon, authenticated
  using (status = 'published');

drop policy if exists "Published car images are publicly readable" on public.car_images;
create policy "Published car images are publicly readable"
  on public.car_images for select to anon, authenticated
  using (exists (
    select 1 from public.cars
    where public.cars.id = car_images.car_id
      and public.cars.status = 'published'
  ));

grant select on public.cars, public.car_images to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'car-image',
  'car-image',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
