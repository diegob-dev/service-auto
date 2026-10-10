import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.queryByTitle(/Mappa di SERVICE SRL/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mostra la mappa Google" }));
    expect(screen.getByTitle(/Mappa di SERVICE SRL/)).toHaveAttribute("src", expect.stringContaining("google.com/maps"));
    fireEvent.click(screen.getByRole("button", { name: "Nascondi la mappa" }));
    expect(screen.queryByTitle(/Mappa di SERVICE SRL/)).not.toBeInTheDocument();
  });

  it("pubblica l'informativa con i dati del titolare", async () => {
    renderRoute("/privacy");
    expect(await screen.findByRole("heading", { name: "Informativa privacy" })).toBeInTheDocument();
    expect(screen.getByText(/00173600180/)).toHaveTextContent("SERVICE SRL");
    expect(screen.getAllByRole("link", { name: "info@servicevigevano.it" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "informativa cookie" })).toHaveAttribute("href", "/cookie");
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
