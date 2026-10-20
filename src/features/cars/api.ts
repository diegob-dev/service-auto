import type { CarWithImages } from "./types";

// Il sito pubblico legge il catalogo con semplici chiamate HTTP alle API di Supabase:
// la libreria supabase-js serve solo all'area amministrativa e non entra in queste pagine.
const CAR_IMAGES_BUCKET = "car-image";
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

const CAR_COLUMNS = [
  "id",
  "slug",
  "brand",
  "model",
  "version",
  "description",
  "year",
  "kilometers",
  "price",
  "fuel",
  "transmission",
  "color",
  "power_cv",
  "optional_features",
  "status",
  "featured",
  "created_at",
  "updated_at",
].join(",");

const IMAGE_COLUMNS = [
  "id",
  "car_id",
  "storage_path",
  "thumbnail_path",
  "alt",
  "position",
  "is_cover",
  "created_at",
].join(",");

export function getCarImageUrl(storagePath: string) {
  return encodeURI(`${supabaseUrl}/storage/v1/object/public/${CAR_IMAGES_BUCKET}/${storagePath.replace(/^\/+/, "")}`);
}

/** URL della miniatura, se esiste; altrimenti quello della foto completa. */
export function getCarThumbnailUrl(image: { storage_path: string; thumbnail_path?: string | null }) {
  return getCarImageUrl(image.thumbnail_path || image.storage_path);
}

export async function getPublishedCars(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<CarWithImages[]> {
  if (!supabaseUrl || !publishableKey) {
    throw new Error("Configurazione Supabase mancante.");
  }

  const params = new URLSearchParams({
    select: `${CAR_COLUMNS},car_images(${IMAGE_COLUMNS})`,
    status: "eq.published",
    order: "featured.desc,created_at.desc",
  });
  if (options?.featuredOnly) params.set("featured", "eq.true");
  if (options?.limit) params.set("limit", String(options.limit));

  // Le chiavi pubblicabili si inviano solo nell'header apikey, non come Bearer token.
  const response = await fetch(`${supabaseUrl}/rest/v1/cars?${params}`, {
    headers: { apikey: publishableKey, Accept: "application/json" },
  });
  if (!response.ok) {
    let message = response.statusText || `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string };
      message = payload.message ?? message;
    } catch {
      // Mantiene lo stato HTTP come messaggio.
    }
    throw new Error(`Impossibile caricare le auto: ${message}`);
  }

  const data = (await response.json()) as CarWithImages[];
  return data.map((car) => ({
    ...car,
    optional_features: car.optional_features ?? [],
    car_images: [...(car.car_images ?? [])].sort(
      (firstImage, secondImage) => firstImage.position - secondImage.position,
    ),
  }));
}
