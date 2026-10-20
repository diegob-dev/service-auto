import { supabase } from "@/lib/supabase";
import type { CarImageRecord, CarRecord, CarWithImages } from "@/features/cars/types";
import { buildCarSlug } from "@/features/cars/slug";
import type { AdminUser, CarInput, StaffRole } from "./types";
import { adminAuthEmail, recoveryEmail } from "../../../supabase/functions/_shared/admin-identity";
import { adminError } from "./errors";
import { createThumbnail } from "./prepareImage";
import { getCarImageUrl } from "@/features/cars/api";

const CAR_IMAGES_BUCKET = "car-image";

function dataOrThrow<T>(data: T | null, error: { message: string } | null) {
  if (error) throw adminError(error.message);
  return data as T;
}

async function throwFunctionError(error: { message: string; context?: unknown }) {
  let message = error.message;
  if (error.context instanceof Response) {
    try {
      const payload = (await error.context.json()) as { error?: string };
      message = payload.error ?? message;
    } catch {
      // Mantiene il messaggio fornito dal client Supabase.
    }
  }
  throw adminError(message);
}

export async function login(identifier: string, password: string) {
  const email = adminAuthEmail(identifier);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return dataOrThrow(data.session, error);
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw adminError(error.message);
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw adminError(error.message);
}

export async function getCurrentAdmin() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id, email, role, active, created_at, updated_at")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (error) throw adminError(error.message);
  return data && (data.role === "admin" || data.role === "seller") && data.active
    ? data as AdminUser
    : null;
}

export async function listCars() {
  const [{ data, error }, { data: privateDetails, error: privateDetailsError }] = await Promise.all([
    supabase.from("cars").select("*, car_images(*)").order("created_at", { ascending: false }),
    supabase.from("car_admin_details").select("car_id, license_plate"),
  ]);
  if (privateDetailsError) throw adminError(privateDetailsError.message);
  const cars = dataOrThrow(data, error) as CarWithImages[];
  const licensePlates = new Map(
    (privateDetails ?? []).map((detail) => [detail.car_id, detail.license_plate]),
  );
  return cars.map((car) => ({
    ...car,
    license_plate: licensePlates.get(car.id) ?? null,
    optional_features: car.optional_features ?? [],
    car_images: [...car.car_images].sort((first, second) => first.position - second.position),
  }));
}

export async function requestPasswordReset(identifier: string) {
  const email = recoveryEmail(identifier);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin`,
  });
  if (error) throw adminError(error.message);
}

export async function saveCar(car: CarInput) {
  const optionalFeatures = car.optional_features
    .map((feature) => feature.trim())
    .filter(Boolean);
  let slug = car.slug;
  if (!car.id) {
    const baseSlug = buildCarSlug(car);
    const { data: existingCars, error: slugError } = await supabase
      .from("cars")
      .select("slug")
      .like("slug", `${baseSlug}%`);
    if (slugError) throw adminError(slugError.message);

    const existingSlugs = new Set((existingCars ?? []).map(({ slug: existingSlug }) => existingSlug));
    slug = baseSlug;
    let suffix = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  const values = {
    slug,
    brand: car.brand,
    model: car.model,
    version: car.version,
    description: car.description,
    year: car.year,
    kilometers: car.kilometers,
    price: car.price,
    fuel: car.fuel,
    transmission: car.transmission,
    color: car.color,
    power_cv: car.power_cv,
    optional_features: [...new Set(optionalFeatures)],
    status: car.status,
    featured: car.featured,
  };
  const { data, error } = await supabase.rpc("staff_save_car", {
    p_car: {
      ...values,
      id: car.id,
      license_plate: car.license_plate,
    },
  });
  return dataOrThrow<CarRecord & { license_plate: string | null }>(data, error);
}

export async function deleteCar(car: CarWithImages) {
  const paths = car.car_images.flatMap((image) => imagePaths(image));
  const { error } = await supabase.from("cars").delete().eq("id", car.id);
  if (error) throw adminError(error.message);
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from(CAR_IMAGES_BUCKET).remove(paths);
    if (storageError) throw adminError(`Auto eliminata, ma alcune immagini non sono state ripulite: ${storageError.message}`);
  }
}

async function invokeUsers<T>(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke<T>("admin-users", { body });
  if (error) await throwFunctionError(error);
  return data as T;
}

export function listUsers() {
  return invokeUsers<AdminUser[]>({ action: "list" });
}

export function saveUser(user: { id?: string; email: string; password?: string; active: boolean; role: StaffRole }) {
  const values = user.id ? user : { ...user, email: recoveryEmail(user.email) };
  return invokeUsers<AdminUser>({ action: user.id ? "update" : "create", user: values });
}

export function deleteUser(userId: string) {
  return invokeUsers<{ id: string }>({ action: "delete", user: { id: userId } });
}

function imagePaths(image: Pick<CarImageRecord, "storage_path" | "thumbnail_path">) {
  return [image.storage_path, image.thumbnail_path].filter((path): path is string => Boolean(path));
}

export async function uploadCarImage(
  carId: string,
  file: File,
  alt: string,
  isCover: boolean,
  thumbnail?: File | null,
) {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const fileId = crypto.randomUUID();
  const storagePath = `${carId}/${fileId}-${safeName}`;
  let thumbnailPath: string | null = null;
  let imageInserted = false;
  const { error: uploadError } = await supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) throw adminError(uploadError.message);

  if (thumbnail) {
    const safeThumbnailName = thumbnail.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
    const path = `${carId}/thumbs/${fileId}-${safeThumbnailName}`;
    const { error: thumbnailError } = await supabase.storage
      .from(CAR_IMAGES_BUCKET)
      .upload(path, thumbnail, { contentType: thumbnail.type, upsert: false });
    // Senza miniatura il sito usa la foto completa: non serve bloccare il caricamento.
    if (!thumbnailError) thumbnailPath = path;
  }

  try {
    const { data: lastImage } = await supabase
      .from("car_images")
      .select("position")
      .eq("car_id", carId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("car_images")
      .insert({
        car_id: carId,
        storage_path: storagePath,
        ...(thumbnailPath ? { thumbnail_path: thumbnailPath } : {}),
        alt,
        position: (lastImage?.position ?? -1) + 1,
        is_cover: false,
      })
      .select()
      .single();
    const inserted = dataOrThrow<CarImageRecord>(data, error);
    imageInserted = true;
    if (!isCover) return inserted;
    return await setCoverImage(inserted);
  } catch (error) {
    // Se il record esiste, conserva anche il file: una selezione copertina
    // fallita non deve creare un riferimento rotto nel database.
    if (!imageInserted) {
      await supabase.storage
        .from(CAR_IMAGES_BUCKET)
        .remove(imagePaths({ storage_path: storagePath, thumbnail_path: thumbnailPath }));
    }
    throw error instanceof Error ? error : new Error("Immagine non salvata");
  }
}

/**
 * Crea la miniatura di una foto caricata prima che esistessero le miniature.
 * Restituisce false se il browser non riesce a generarla.
 */
export async function addMissingThumbnail(image: CarImageRecord) {
  const response = await fetch(getCarImageUrl(image.storage_path));
  if (!response.ok) throw new Error(`Foto non scaricabile (${response.status})`);
  const blob = await response.blob();
  const fileName = image.storage_path.split("/").pop() || "foto";
  const thumbnail = await createThumbnail(new File([blob], fileName, { type: blob.type }));
  if (!thumbnail) return false;

  const safeName = thumbnail.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const thumbnailPath = `${image.car_id}/thumbs/${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .upload(thumbnailPath, thumbnail, { contentType: thumbnail.type, upsert: true });
  if (uploadError) throw adminError(uploadError.message);

  const { error } = await supabase
    .from("car_images")
    .update({ thumbnail_path: thumbnailPath })
    .eq("id", image.id)
    .is("thumbnail_path", null);
  if (error) throw adminError(error.message);
  return true;
}

/** Salva il nuovo ordine delle foto: la posizione diventa l'indice nell'elenco. */
export async function reorderCarImages(images: CarImageRecord[]) {
  for (const [position, image] of images.entries()) {
    if (image.position === position) continue;
    const { error } = await supabase
      .from("car_images")
      .update({ position })
      .eq("id", image.id);
    if (error) throw adminError(error.message);
  }
}

export async function setCoverImage(image: CarImageRecord) {
  const { data, error } = await supabase.rpc("staff_set_car_cover", {
    p_car_id: image.car_id,
    p_image_id: image.id,
  });
  return dataOrThrow<CarImageRecord>(data, error);
}

export async function deleteCarImage(image: CarImageRecord) {
  const { error } = await supabase.from("car_images").delete().eq("id", image.id);
  if (error) throw adminError(error.message);
  const { error: storageError } = await supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .remove(imagePaths(image));
  if (storageError) throw adminError(`Immagine rimossa dall'auto, ma il file non è stato ripulito: ${storageError.message}`);
}
