export type CarStatus = "draft" | "published" | "sold";

export type CarRecord = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string | null;
  description: string | null;
  year: number | null;
  kilometers: number | null;
  price: number | null;
  fuel: string | null;
  transmission: string | null;
  color: string | null;
  power_cv: number | null;
  optional_features: string[];
  license_plate?: string | null;
  status: CarStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CarImageRecord = {
  id: string;
  car_id: string;
  storage_path: string;
  /** Miniatura da 640 px; assente per le foto caricate prima della sua introduzione. */
  thumbnail_path?: string | null;
  alt: string;
  position: number;
  is_cover: boolean;
  created_at: string;
};

export type CarWithImages = CarRecord & {
  car_images: CarImageRecord[];
};
