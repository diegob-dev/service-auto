import type { CarInput } from "./types";

export const adminInputClass =
  "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary";

export const emptyCar: CarInput = {
  slug: "",
  brand: "",
  model: "",
  version: null,
  description: null,
  year: null,
  kilometers: null,
  price: null,
  fuel: null,
  transmission: null,
  color: null,
  power_cv: null,
  optional_features: [],
  license_plate: null,
  status: "draft",
  featured: false,
};
