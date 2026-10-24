import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as adminApi from "../api";
import type { CarInput } from "../types";
import { ImagesEditor } from "./ImagesEditor";

vi.mock("./ImageArchive", () => ({ ImageArchive: () => null }));

vi.mock("@/features/cars/api", () => ({
  getCarImageUrl: (path: string) => `https://images.test/${path}`,
  getCarThumbnailUrl: (image: { storage_path: string; thumbnail_path?: string | null }) =>
    `https://images.test/${image.thumbnail_path || image.storage_path}`,
}));

vi.mock("../api", () => ({
  uploadCarImage: vi.fn(),
  setCoverImage: vi.fn(),
  deleteCarImage: vi.fn(),
  reorderCarImages: vi.fn(),
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
  beforeEach(() => vi.clearAllMocks());

  it("aggiorna le foto e svuota il modulo dopo un caricamento asincrono riuscito", async () => {
    vi.mocked(adminApi.uploadCarImage).mockResolvedValue({} as never);
    const onChanged = vi.fn(async () => undefined);
    render(<ImagesEditor car={car} onChanged={onChanged} />);
    const input = screen.getByLabelText(/Scegli immagini/) as HTMLInputElement;
    const file = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });
    const form = input.form!;
    const reset = vi.spyOn(form, "reset");
    const NativeFormData = globalThis.FormData;
    vi.spyOn(globalThis, "FormData").mockImplementation(function (element) {
      const data = new NativeFormData(element);
      data.set("image", file);
      return data;
    });
    try {
      fireEvent.submit(form);
      await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
      expect(reset).toHaveBeenCalledOnce();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("distingue chiaramente la copertina dalle altre fotografie", () => {
    render(<ImagesEditor car={car} onChanged={vi.fn(async () => undefined)} />);

    expect(screen.getByText("Copertina attuale")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Usa come copertina: Vista frontale" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Usa come copertina: Vista posteriore" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Usa come copertina/ })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Carica fotografie" })).toBeInTheDocument();
  });

  it("riordina le fotografie con le frecce", async () => {
    vi.mocked(adminApi.reorderCarImages).mockResolvedValue(undefined);
    const onChanged = vi.fn(async () => undefined);
    render(<ImagesEditor car={car} onChanged={onChanged} />);

    expect(screen.getByRole("button", { name: "Sposta prima la foto 1" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Sposta dopo la foto 1" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
    expect(vi.mocked(adminApi.reorderCarImages).mock.calls[0][0].map(({ id }) => id)).toEqual(["rear", "cover"]);
  });
});
