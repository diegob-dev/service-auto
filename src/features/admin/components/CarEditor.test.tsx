import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CarInput } from "../types";
import { CarEditor } from "./CarEditor";

vi.mock("@/features/cars/api", () => ({
  getCarImageUrl: vi.fn(),
}));

const car: CarInput = {
  id: "car-id",
  slug: "volvo-xc60-2024",
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
  optional_features: [],
  status: "draft",
  featured: false,
  car_images: [],
};

describe("CarEditor", () => {
  it("guida l'utente dai dati agli optional e poi alle immagini", async () => {
    const onSubmit = vi.fn(async () => true);
    render(
      <CarEditor
        value={car}
        busy={false}
        showLicensePlate
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        onImagesChanged={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByText("Passaggio 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Avanti" }));
    expect(screen.getByLabelText("Descrizione")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();

    const form = screen.getByLabelText("Descrizione").closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    expect(await screen.findByLabelText(/Scegli immagine/)).toBeVisible();
    expect(onSubmit).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Vai al riepilogo" }));
    expect(screen.getByText("Dati dell’auto")).toBeVisible();
    expect(screen.getByText("Pubblicazione")).toBeVisible();
  });

  it("non salva con un invio implicito nel primo passaggio", () => {
    const onSubmit = vi.fn(async () => true);
    render(
      <CarEditor
        value={car}
        busy={false}
        showLicensePlate
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        onImagesChanged={vi.fn(async () => undefined)}
      />,
    );

    const form = screen.getByLabelText("Marca").closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(screen.getByLabelText("Descrizione")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("permette di aprire direttamente la pubblicazione per un'auto esistente", () => {
    render(
      <CarEditor
        value={car}
        busy={false}
        showLicensePlate
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSubmit={vi.fn(async () => true)}
        onImagesChanged={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Vai al passaggio 4: Riepilogo e pubblicazione" }));

    expect(screen.getByLabelText("Stato")).toBeVisible();
    expect(screen.getByRole("button", { name: "Salva come bozza" })).toBeVisible();
  });

  it("non mostra la targa al venditore", () => {
    render(
      <CarEditor
        value={car}
        busy={false}
        showLicensePlate={false}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSubmit={vi.fn(async () => true)}
        onImagesChanged={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.queryByLabelText("Targa (solo admin)")).not.toBeInTheDocument();
  });
});
