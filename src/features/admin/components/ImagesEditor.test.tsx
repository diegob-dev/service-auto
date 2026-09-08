import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CarInput } from "../types";
import { ImagesEditor } from "./ImagesEditor";

vi.mock("@/features/cars/api", () => ({
  getCarImageUrl: (path: string) => `https://images.test/${path}`,
}));

vi.mock("../api", () => ({
  uploadCarImage: vi.fn(),
  setCoverImage: vi.fn(),
  deleteCarImage: vi.fn(),
}));

const car: CarInput & { id: string } = {
  id: "car-id",
  slug: "volvo-xc60",
  brand: "Volvo",
  model: "XC60",
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
  status: "draft",
  featured: false,
  car_images: [
    { id: "cover", car_id: "car-id", storage_path: "cover.jpg", alt: "Vista frontale", position: 0, is_cover: true, created_at: "2026-09-08" },
    { id: "rear", car_id: "car-id", storage_path: "rear.jpg", alt: "Vista posteriore", position: 1, is_cover: false, created_at: "2026-09-08" },
  ],
};

describe("ImagesEditor", () => {
  it("distingue chiaramente la copertina dalle altre fotografie", () => {
    render(<ImagesEditor car={car} onChanged={vi.fn(async () => undefined)} />);

    expect(screen.getByText("Copertina attuale")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Usa come copertina: Vista frontale" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Usa come copertina: Vista posteriore" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Usa come copertina" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Carica fotografia" })).toBeInTheDocument();
  });
});
