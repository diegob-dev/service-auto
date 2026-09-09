import { fireEvent, render, screen } from "@testing-library/react";
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
  optional_features: [],
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
    expect(screen.getByRole("status", { name: "Caricamento auto" })).toBeInTheDocument();

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

  it("filtra le auto nella pagina pubblica", () => {
    const secondCar: CarWithImages = {
      ...car,
      id: "second-car",
      slug: "fiat-panda-2020",
      brand: "Fiat",
      model: "Panda",
      version: null,
      year: 2020,
      kilometers: 65000,
      price: 12900,
      fuel: "Ibrida",
      transmission: "Manuale",
    };
    renderList({ cars: [car, secondCar], isLoading: false, isError: false, showFilters: true });

    expect(screen.getByText("2 auto disponibili")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mostra filtri" }));
    expect(screen.getByRole("button", { name: "Nascondi filtri" })).toHaveAttribute("aria-expanded", "true");
    fireEvent.change(screen.getByRole("textbox", { name: "Cerca auto" }), { target: { value: "Fiat" } });

    expect(screen.getByText("1 auto disponibile")).toBeInTheDocument();
    expect(screen.getByText("Fiat Panda")).toBeInTheDocument();
    expect(screen.queryByText("Volvo XC60")).not.toBeInTheDocument();
  });
});
