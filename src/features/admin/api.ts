import { supabase } from "@/lib/supabase";
import type { CarImageRecord, CarRecord, CarWithImages } from "@/features/cars/types";
import type { AdminUser, CarInput } from "./types";

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

export async function login(email: string, password: string) {
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
  return data?.role === "admin" && data.active ? data : null;
}

export async function listCars() {
  const { data, error } = await supabase
    .from("cars")
    .select("*, car_images(*)")
    .order("created_at", { ascending: false });
  const cars = dataOrThrow(data, error) as CarWithImages[];
  return cars.map((car) => ({
    ...car,
    car_images: [...car.car_images].sort((first, second) => first.position - second.position),
  }));
}

export async function saveCar(car: CarInput) {
  const values = {
    slug: car.slug,
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
    status: car.status,
    featured: car.featured,
  };
  const query = car.id
    ? supabase.from("cars").update({ ...values, updated_at: new Date().toISOString() }).eq("id", car.id)
    : supabase.from("cars").insert(values);
  const { data, error } = await query.select().single();
  return dataOrThrow<CarRecord>(data, error);
}

export async function deleteCar(car: CarWithImages) {
  const paths = car.car_images.map((image) => image.storage_path);
  if (paths.length) {
    const { error } = await supabase.storage.from(CAR_IMAGES_BUCKET).remove(paths);
    if (error) throw new Error(error.message);
  }
  const { error } = await supabase.from("cars").delete().eq("id", car.id);
  if (error) throw new Error(error.message);
}

async function invokeUsers<T>(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke<T>("admin-users", { body });
  if (error) await throwFunctionError(error);
  return data as T;
}

export function listUsers() {
  return invokeUsers<AdminUser[]>({ action: "list" });
}

export function saveUser(user: { id?: string; email: string; password?: string; active: boolean }) {
  return invokeUsers<AdminUser>({ action: user.id ? "update" : "create", user });
}

export async function uploadCarImage(
  carId: string,
  file: File,
  alt: string,
  isCover: boolean,
) {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const storagePath = `${carId}/${crypto.randomUUID()}-${safeName}`;
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
    if (isCover) {
      const { error } = await supabase.from("car_images").update({ is_cover: false }).eq("car_id", carId);
      if (error) throw error;
    }
    const { data, error } = await supabase
      .from("car_images")
      .insert({
        car_id: carId,
        storage_path: storagePath,
        alt,
        position: (lastImage?.position ?? -1) + 1,
        is_cover: isCover,
      })
      .select()
      .single();
    return dataOrThrow<CarImageRecord>(data, error);
  } catch (error) {
    await supabase.storage.from(CAR_IMAGES_BUCKET).remove([storagePath]);
    throw error instanceof Error ? error : new Error("Immagine non salvata");
  }
}

export async function setCoverImage(image: CarImageRecord) {
  const { error: clearError } = await supabase
    .from("car_images")
    .update({ is_cover: false })
    .eq("car_id", image.car_id);
  if (clearError) throw new Error(clearError.message);
  const { data, error } = await supabase
    .from("car_images")
    .update({ is_cover: true })
    .eq("id", image.id)
    .select()
    .single();
  return dataOrThrow<CarImageRecord>(data, error);
}

export async function deleteCarImage(image: CarImageRecord) {
  const { error: storageError } = await supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .remove([image.storage_path]);
  if (storageError) throw new Error(storageError.message);
  const { error } = await supabase.from("car_images").delete().eq("id", image.id);
  if (error) throw new Error(error.message);
}
