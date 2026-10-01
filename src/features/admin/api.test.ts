import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CarInput } from "./types";
import type { CarImageRecord, CarWithImages } from "@/features/cars/types";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
  storageFrom: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mocks.from,
    rpc: mocks.rpc,
    storage: { from: mocks.storageFrom },
    auth: {},
    functions: {},
  },
}));

import { deleteCar, saveCar, setCoverImage } from "./api";

const carInput: CarInput = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "volvo-xc60",
  brand: "Volvo",
  model: "XC60",
  version: null,
  description: null,
  year: 2024,
  kilometers: 12000,
  price: 39900,
  fuel: "Benzina",
  transmission: "Automatico",
  color: null,
  power_cv: null,
  optional_features: [" Navigatore ", "", "Navigatore"],
  license_plate: " ab123cd ",
  status: "draft",
  featured: false,
};

describe("admin API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("salva auto e targa con una singola operazione atomica", async () => {
    const saved = {
      ...carInput,
      id: carInput.id!,
      license_plate: "AB123CD",
      optional_features: ["Navigatore"],
      created_at: "2026-09-30",
      updated_at: "2026-09-30",
    };
    mocks.rpc.mockResolvedValue({ data: saved, error: null });

    await expect(saveCar(carInput)).resolves.toEqual(saved);
    expect(mocks.rpc).toHaveBeenCalledWith("staff_save_car", {
      p_car: expect.objectContaining({
        id: carInput.id,
        license_plate: carInput.license_plate,
        optional_features: ["Navigatore"],
      }),
    });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("cambia copertina tramite la funzione transazionale", async () => {
    const image: CarImageRecord = {
      id: "image-id",
      car_id: carInput.id!,
      storage_path: "car/image.jpg",
      alt: "Vista frontale",
      position: 0,
      is_cover: false,
      created_at: "2026-09-30",
    };
    mocks.rpc.mockResolvedValue({ data: { ...image, is_cover: true }, error: null });

    await setCoverImage(image);

    expect(mocks.rpc).toHaveBeenCalledWith("staff_set_car_cover", {
      p_car_id: image.car_id,
      p_image_id: image.id,
    });
  });

  it("elimina il record dell'auto prima dei file nello storage", async () => {
    const operations: string[] = [];
    mocks.from.mockReturnValue({
      delete: () => ({
        eq: async () => {
          operations.push("database");
          return { error: null };
        },
      }),
    });
    mocks.storageFrom.mockReturnValue({
      remove: async () => {
        operations.push("storage");
        return { error: null };
      },
    });
    const car = {
      ...carInput,
      id: carInput.id!,
      created_at: "2026-09-30",
      updated_at: "2026-09-30",
      car_images: [{
        id: "image-id",
        car_id: carInput.id!,
        storage_path: "car/image.jpg",
        alt: "",
        position: 0,
        is_cover: true,
        created_at: "2026-09-30",
      }],
    } as CarWithImages;

    await deleteCar(car);

    expect(operations).toEqual(["database", "storage"]);
  });
});
