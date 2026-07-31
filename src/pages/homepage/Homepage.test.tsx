import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { Homepage } from ".";

vi.mock("./hooks/useHomepage", () => ({
  useHomepage: () => ({ cars: [], isLoading: false, isError: false }),
}));

describe("Homepage", () => {
  it("rende CTA come link accessibili senza button annidati", () => {
    render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>,
    );

    const contactLink = screen.getByRole("link", {
      name: /prenota appuntamento/i,
    });
    const servicesLink = screen.getByRole("link", {
      name: /scopri tutti i servizi/i,
    });

    expect(contactLink).toHaveAttribute("href", "/contatti");
    expect(contactLink.closest("button")).toBeNull();
    expect(servicesLink).toHaveAttribute("href", "/servizi");
  });
});
