import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CarGallery } from "./CarGallery";
import type { CarImageRecord } from "./types";

vi.mock("./api", () => ({
  getCarImageUrl: (path: string) => `https://images.test/${path}`,
}));

const images: CarImageRecord[] = [
  { id: "rear", car_id: "car", storage_path: "rear.jpg", alt: "Vista posteriore", position: 1, is_cover: false, created_at: "2026-09-08" },
  { id: "front", car_id: "car", storage_path: "front.jpg", alt: "Vista frontale", position: 0, is_cover: true, created_at: "2026-09-08" },
];

describe("CarGallery", () => {
  it("apre la copertina a tutto schermo e permette di cambiare foto", () => {
    render(<CarGallery images={images} carName="Volvo XC60" />);

    fireEvent.click(screen.getByRole("button", { name: "Apri Vista frontale a tutto schermo" }));
    const dialog = screen.getByRole("dialog", { name: "Fotografia a tutto schermo di Volvo XC60" });
    expect(within(dialog).getByRole("img", { name: "Vista frontale" })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Fotografia successiva" }));
    expect(within(dialog).getByRole("img", { name: "Vista posteriore" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
