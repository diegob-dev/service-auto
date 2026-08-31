import { supabase } from "@/lib/supabase";
import type { CarWithImages } from "./types";

const CAR_IMAGES_BUCKET = "car-image";

export function getCarImageUrl(storagePath: string) {
  const { data } = supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function getPublishedCars(): Promise<CarWithImages[]> {
  const { data, error } = await supabase
    .from("cars")
    .select(
      `
      *,
      car_images (
        id,
        car_id,
        storage_path,
        alt,
        position,
        is_cover,
        created_at
      )
    `,
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Impossibile caricare le auto: ${error.message}`);
  }

  return (data ?? []).map((car) => ({
    ...car,
    car_images: [...car.car_images].sort(
      (firstImage, secondImage) => firstImage.position - secondImage.position,
    ),
  })) as CarWithImages[];
}
