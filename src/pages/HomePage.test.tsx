import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { HomePage } from "./HomePage";

vi.mock("@/features/cars/hooks", () => ({
  usePublishedCars: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

describe("HomePage", () => {
  it("rende CTA come link accessibili senza button annidati", () => {
    render(
      <MemoryRouter>
        <HomePage />
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
