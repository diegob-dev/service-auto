import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminPage } from "./AdminPage";
import * as adminApi from "@/features/admin/api";
import { supabase } from "@/lib/supabase";

vi.mock("@/features/admin/api", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  updatePassword: vi.fn(),
  requestPasswordReset: vi.fn(),
  getCurrentAdmin: vi.fn(),
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
  beforeEach(() => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
    } as never);
    vi.mocked(adminApi.listCars).mockResolvedValue([]);
    vi.mocked(adminApi.listUsers).mockResolvedValue([]);
  });

  it("non espone credenziali predefinite e richiede entrambi i campi", async () => {
    renderAdmin();

    expect(screen.queryByText(/password vuota/i)).not.toBeInTheDocument();
    expect(await screen.findByRole("textbox", { name: "Username o email" })).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
  });

  it("mostra chiaramente la verifica iniziale dell'accesso", () => {
    vi.mocked(supabase.auth.getSession).mockReturnValue(new Promise(() => undefined));

    renderAdmin();

    expect(screen.getByRole("status", { name: "Verifica accesso amministrativo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Accesso area riservata" })).toBeVisible();
  });

  it("mostra il caricamento senza contatori a zero mentre prepara la dashboard", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "session", user: { id: "admin-id" } } },
    } as never);
    vi.mocked(adminApi.getCurrentAdmin).mockResolvedValue({
      id: "admin-id",
      email: "admin",
      role: "admin",
      active: true,
      created_at: "2026-10-01",
      updated_at: "2026-10-01",
    });
    vi.mocked(adminApi.listCars).mockReturnValue(new Promise(() => undefined));

    renderAdmin();

    expect(await screen.findByRole("status", { name: "Caricamento dati amministrativi" })).toBeInTheDocument();
    expect(screen.queryByText("Auto (0)")).not.toBeInTheDocument();
    expect(screen.queryByText("Utenti (0)")).not.toBeInTheDocument();
  });
});
