import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { AdminPage } from "./AdminPage";

vi.mock("@/features/admin/api", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  updatePassword: vi.fn(),
  listCars: vi.fn(async () => []),
  listUsers: vi.fn(async () => []),
  saveCar: vi.fn(),
  deleteCar: vi.fn(),
  saveUser: vi.fn(),
  uploadCarImage: vi.fn(),
  setCoverImage: vi.fn(),
  deleteCarImage: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

function renderAdmin() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminPage />
    </QueryClientProvider>,
  );
}

describe("AdminPage", () => {
  it("non espone credenziali predefinite e richiede entrambi i campi", async () => {
    renderAdmin();

    expect(screen.queryByText(/password vuota/i)).not.toBeInTheDocument();
    expect(await screen.findByRole("textbox", { name: "Email" })).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
  });
});
