import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CarWithImages } from "@/features/cars/types";
import { CarsPanel } from "./CarsPanel";

const car: CarWithImages = {
  id: "1",
  slug: "fiat-panda",
  brand: "Fiat",
  model: "Panda",
  version: "1.0 Hybrid",
  description: null,
  year: null,
  kilometers: null,
  price: null,
  fuel: null,
  transmission: null,
  color: null,
  power_cv: null,
  optional_features: [],
  license_plate: "AB123CD",
  status: "published",
  featured: false,
  created_at: "2026-09-08T00:00:00Z",
  updated_at: "2026-09-08T00:00:00Z",
  car_images: [],
};

describe("CarsPanel", () => {
  it("mostra le auto in tabella con intestazioni e trattini per i valori mancanti", () => {
    render(<CarsPanel cars={[car]} showLicensePlate onCreate={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Anno" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Targa" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Chilometri" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Prezzo" })).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(3);
    expect(screen.getAllByText("Pubblicata")).toHaveLength(2);
  });

  it("filtra i risultati per singola colonna", () => {
    render(<CarsPanel cars={[car]} showLicensePlate onCreate={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Filtra per targa" }), { target: { value: "ZZ" } });
    expect(screen.getByText("Nessuna auto corrisponde ai filtri selezionati.")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Filtra per targa" }), { target: { value: "AB123" } });
    expect(screen.getByText("AB123CD")).toBeInTheDocument();
  });

  it("filtra anno, chilometri e prezzo con intervalli da-a", () => {
    const completeCar = { ...car, year: 2024, kilometers: 42000, price: 28900 };
    render(<CarsPanel cars={[completeCar]} showLicensePlate onCreate={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

    fireEvent.change(screen.getByRole("spinbutton", { name: "Anno da" }), { target: { value: "2025" } });
    expect(screen.getByText("Nessuna auto corrisponde ai filtri selezionati.")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("spinbutton", { name: "Anno da" }), { target: { value: "2020" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Anno a" }), { target: { value: "2024" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Chilometri da" }), { target: { value: "40000" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Chilometri a" }), { target: { value: "50000" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Prezzo da" }), { target: { value: "25000" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Prezzo a" }), { target: { value: "30000" } });

    expect(screen.getByText("AB123CD")).toBeInTheDocument();
  });

  it("nasconde la targa nella vista venditore", () => {
    render(<CarsPanel cars={[car]} showLicensePlate={false} onCreate={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByRole("columnheader", { name: "Targa" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Filtra per targa" })).not.toBeInTheDocument();
    expect(screen.queryByText("AB123CD")).not.toBeInTheDocument();
  });
});
