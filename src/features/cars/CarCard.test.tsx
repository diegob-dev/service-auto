import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { CarWithImages } from "./types";
import { CarCard } from "./CarCard";

vi.mock("./api", () => ({
  getCarImageUrl: (storagePath: string) => `https://images.test/${storagePath}`,
}));

const car: CarWithImages = {
  id: "test-car-id",
  slug: "volvo-xc60-t6-2024",
  brand: "Volvo",
  model: "XC60",
  version: "T6 AWD",
  description: null,
  year: 2024,
  kilometers: 12000,
  price: 39900,
  fuel: "Benzina",
  transmission: "Automatico",
  color: null,
  power_cv: null,
  optional_features: [],
  status: "published",
  featured: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  car_images: [],
};

function renderCard(testCar: CarWithImages) {
  return render(
    <MemoryRouter>
      <CarCard car={testCar} buttonText="Scopri di più" />
    </MemoryRouter>,
  );
}

describe("CarCard", () => {
  it("mostra label e testi espliciti per i dati mancanti", () => {
    renderCard({ ...car, version: null, description: "Note di importazione da completare", year: null, price: null, kilometers: null, fuel: null });
    expect(screen.getByText("Marca e modello")).toBeInTheDocument();
    expect(screen.getByText("Anno")).toBeInTheDocument();
    expect(screen.getByText("Chilometri")).toBeInTheDocument();
    expect(screen.getByText("Alimentazione")).toBeInTheDocument();
    expect(screen.getByText("Prezzo")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(4);
    expect(screen.queryByText("Note di importazione da completare")).not.toBeInTheDocument();
    expect(screen.queryByText("0 km")).not.toBeInTheDocument();
  });

  it("mantiene i chilometri zero reali e la versione disponibile", () => {
    renderCard({ ...car, kilometers: 0 });
    expect(screen.getByText("0 km")).toBeInTheDocument();
    expect(screen.queryByText("Versione")).not.toBeInTheDocument();
    expect(screen.getByText(/T6 AWD/)).toBeInTheDocument();
    expect(screen.queryByText("-")).not.toBeInTheDocument();
  });

  it("mantiene il pulsante allineato in fondo alla card", () => {
    renderCard(car);

    const button = screen.getByRole("link", { name: "Scopri di più" });
    expect(button.closest('[data-slot="card-footer"]')).toHaveClass("mt-auto");
    expect(button.closest('[data-slot="card"]')).toHaveClass("h-full");
  });

  it("mostra un messaggio quando l'auto non ha immagini", () => {
    renderCard(car);

    expect(screen.getByText("Immagine non disponibile")).toBeInTheDocument();

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("mostra l'immagine di copertina", () => {
    renderCard({
      ...car,
      car_images: [
        {
          id: "image-1",
          car_id: car.id,
          storage_path: "volvo-xc60-b5-awd-2023/cover.jpg",
          alt: "Volvo XC60 vista frontale",
          position: 0,
          is_cover: true,
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
    });

    expect(
      screen.getByRole("img", { name: "Volvo XC60 vista frontale" }),
    ).toHaveAttribute(
      "src",
      "https://images.test/volvo-xc60-b5-awd-2023/cover.jpg",
    );
  });
});
