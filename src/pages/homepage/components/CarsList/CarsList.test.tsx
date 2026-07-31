import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CarsList } from ".";
import type { Car } from "../../types";

const car: Car = {
  id: 7,
  model: "Volvo XC60",
  description: "T6 AWD",
  year: 2024,
  kilometers: 12000,
  price: 39900,
  fuel: "Benzina",
  src: "/car.jpg",
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
      "/auto-usate/7",
    );
  });
});
