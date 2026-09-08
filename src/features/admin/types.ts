import type { CarImageRecord, CarRecord } from "@/features/cars/types";

export type StaffRole = "admin" | "seller";

export type AdminUser = {
  id: string;
  email: string;
  role: StaffRole;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CarInput = Omit<
  CarRecord,
  "id" | "created_at" | "updated_at"
> & { id?: string; car_images?: CarImageRecord[] };
