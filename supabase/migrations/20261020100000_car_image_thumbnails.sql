-- Miniature (640 px) delle foto auto, usate nelle card del catalogo e nelle anteprime.
-- Le foto caricate prima di questa migrazione restano senza miniatura finché non si
-- esegue scripts/generate-thumbnails.py; nel frattempo il sito usa la foto completa.
alter table public.car_images
  add column if not exists thumbnail_path text unique;

notify pgrst, 'reload schema';
