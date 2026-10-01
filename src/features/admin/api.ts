import { supabase } from "@/lib/supabase";
import type { CarImageRecord, CarRecord, CarWithImages } from "@/features/cars/types";
import { buildCarSlug } from "@/features/cars/slug";
import type { AdminUser, CarInput, StaffRole } from "./types";
import { adminAuthEmail } from "../../../supabase/functions/_shared/admin-identity";

const CAR_IMAGES_BUCKET = "car-image";

function dataOrThrow<T>(data: T | null, error: { message: string } | null) {
  if (error) throw new Error(error.message);
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
  throw new Error(message);
}

export async function login(identifier: string, password: string) {
  const email = adminAuthEmail(identifier);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return dataOrThrow(data.session, error);
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export async function getCurrentAdmin() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id, email, role, active, created_at, updated_at")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data && (data.role === "admin" || data.role === "seller") && data.active
    ? data as AdminUser
    : null;
}

export async function listCars() {
  const [{ data, error }, { data: privateDetails, error: privateDetailsError }] = await Promise.all([
    supabase.from("cars").select("*, car_images(*)").order("created_at", { ascending: false }),
    supabase.from("car_admin_details").select("car_id, license_plate"),
  ]);
  if (privateDetailsError) throw new Error(privateDetailsError.message);
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
    if (slugError) throw new Error(slugError.message);

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
  const paths = car.car_images.map((image) => image.storage_path);
  const { error } = await supabase.from("cars").delete().eq("id", car.id);
  if (error) throw new Error(error.message);
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from(CAR_IMAGES_BUCKET).remove(paths);
    if (storageError) throw new Error(`Auto eliminata, ma alcune immagini non sono state ripulite: ${storageError.message}`);
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
  return invokeUsers<AdminUser>({ action: user.id ? "update" : "create", user });
}

export function deleteUser(userId: string) {
  return invokeUsers<{ id: string }>({ action: "delete", user: { id: userId } });
}

export async function uploadCarImage(
  carId: string,
  file: File,
  alt: string,
  isCover: boolean,
) {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const storagePath = `${carId}/${crypto.randomUUID()}-${safeName}`;
  let imageInserted = false;
  const { error: uploadError } = await supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

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
      await supabase.storage.from(CAR_IMAGES_BUCKET).remove([storagePath]);
    }
    throw error instanceof Error ? error : new Error("Immagine non salvata");
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
  if (error) throw new Error(error.message);
  const { error: storageError } = await supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .remove([image.storage_path]);
  if (storageError) throw new Error(`Immagine rimossa dall'auto, ma il file non è stato ripulito: ${storageError.message}`);
}
