import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("routing", () => {
  it("mostra la pagina contatti", () => {
    renderRoute("/contatti");

    expect(
      screen.getByRole("heading", { name: "Contatti" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /chiama/i })).toHaveAttribute(
      "href",
      "tel:038178406",
    );
  });

  it("mostra una pagina 404 per le route sconosciute", () => {
    renderRoute("/pagina-inesistente");

    expect(
      screen.getByRole("heading", { name: "Pagina non trovata" }),
    ).toBeInTheDocument();
  });
});
