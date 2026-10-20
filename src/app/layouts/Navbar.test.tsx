import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Navbar } from "./Navbar";

function renderNavbar() {
  return render(
    <MemoryRouter initialEntries={["/servizi"]}>
      <Navbar />
    </MemoryRouter>,
  );
}

describe("Navbar mobile", () => {
  it("chiude il menu con Esc e riporta il focus sul pulsante", () => {
    renderNavbar();
    const toggle = screen.getByRole("button", { name: "Apri menu" });
    fireEvent.click(toggle);
    expect(screen.getByRole("navigation", { name: "Navigazione mobile" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("navigation", { name: "Navigazione mobile" })).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it("chiude il menu quando si cambia pagina dal logo", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: "Apri menu" }));
    fireEvent.click(screen.getAllByRole("link", { name: "SERVICE SRL - Home" })[0]);

    expect(screen.queryByRole("navigation", { name: "Navigazione mobile" })).not.toBeInTheDocument();
  });
});
