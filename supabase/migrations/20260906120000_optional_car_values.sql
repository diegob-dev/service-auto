-- Missing vehicle data is NULL; zero remains a valid, known numeric value.
alter table public.cars
  alter column year drop not null,
  alter column kilometers drop not null,
  alter column kilometers drop default,
  alter column price drop not null,
  alter column price drop default;

notify pgrst, 'reload schema';
