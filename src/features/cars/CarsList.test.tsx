import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CarsList } from "./CarsList";
import type { CarWithImages } from "./types";

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
  status: "published",
  featured: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  car_images: [],
};

function renderList(props: React.ComponentProps<typeof CarsList>) {
  return render(
    <MemoryRouter>
      <CarsList {...props} />
    </MemoryRouter>,
  );
}

describe("CarsList", () => {
  it("gestisce caricamento, errore e lista vuota", () => {
    const { rerender } = renderList({
      cars: undefined,
      isLoading: true,
      isError: false,
    });
    expect(screen.getByText("Caricamento...")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <CarsList cars={undefined} isLoading={false} isError />
      </MemoryRouter>,
    );
    expect(screen.getByText(/errore nel caricamento/i)).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <CarsList cars={[]} isLoading={false} isError={false} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Nessuna auto disponibile.")).toBeInTheDocument();
  });

  it("collega ogni scheda alla pagina di dettaglio", () => {
    renderList({ cars: [car], isLoading: false, isError: false });

    expect(screen.getByRole("link", { name: "Scopri di più" })).toHaveAttribute(
      "href",
      "/auto-usate/volvo-xc60-t6-2024",
    );
  });
});
