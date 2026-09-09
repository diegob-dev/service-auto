import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("routing", () => {
  it("mostra la pagina contatti", async () => {
    renderRoute("/contatti");

    expect(
      await screen.findByRole("heading", { name: "Contatti" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /chiama/i })).toHaveAttribute(
      "href",
      "tel:038178406",
    );
  });

  it("mostra una pagina 404 per le route sconosciute", async () => {
    renderRoute("/pagina-inesistente");

    expect(
      await screen.findByRole("heading", { name: "Pagina non trovata" }),
    ).toBeInTheDocument();
  });

  it("torna all'inizio quando entra in una pagina", async () => {
    renderRoute("/servizi");

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  });
});
