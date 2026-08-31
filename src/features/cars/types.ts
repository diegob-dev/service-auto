export type CarStatus = "draft" | "published" | "sold";

export type CarRecord = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string | null;
  description: string | null;
  year: number;
  kilometers: number;
  price: number;
  fuel: string | null;
  transmission: string | null;
  color: string | null;
  power_cv: number | null;
  status: CarStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CarImageRecord = {
  id: string;
  car_id: string;
  storage_path: string;
  alt: string;
  position: number;
  is_cover: boolean;
  created_at: string;
};

export type CarWithImages = CarRecord & {
  car_images: CarImageRecord[];
};

// Modello temporaneo usato dall'interfaccia collegata a db.json.
// Verrà rimosso quando le card saranno alimentate da Supabase.
export type LegacyCar = {
  id: number;
  model: string;
  description: string;
  year: number;
  kilometers: number;
  price: number;
  fuel: string;
  src: string;
};
