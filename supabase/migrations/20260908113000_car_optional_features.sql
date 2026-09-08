alter table public.cars
  add column if not exists optional_features text[] not null default '{}';

notify pgrst, 'reload schema';
