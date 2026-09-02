import type { CarRecord } from "@/features/cars/types";

export type AdminUser = {
  id: string;
  username: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CarInput = Omit<
  CarRecord,
  "id" | "created_at" | "updated_at"
> & { id?: string };
