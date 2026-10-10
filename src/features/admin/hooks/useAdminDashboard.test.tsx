import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { passwordRecoveryRedirect } from "@/lib/passwordRecoveryRedirect";
import { useAdminDashboard } from "./useAdminDashboard";
import * as adminApi from "../api";

vi.mock("../api", () => ({
  saveUser: vi.fn(async () => ({})),
  listCars: vi.fn(async () => []),
  listUsers: vi.fn(async () => []),
  getCurrentAdmin: vi.fn(),
  updatePassword: vi.fn(async () => undefined),
  logout: vi.fn(async () => undefined),
}));
vi.mock("@/lib/supabase", () => ({
  supabase: { auth: {
    getSession: vi.fn(async () => ({ data: { session: null } })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  } },
}));

describe("creazione utenti", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    passwordRecoveryRedirect.active = false;
    passwordRecoveryRedirect.invalid = false;
    window.history.replaceState(null, "", "/admin");
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null } as never);
  });
  afterEach(() => { sessionStorage.clear(); passwordRecoveryRedirect.active = false; });

  it("riconosce un link già consumato da Supabase prima di registrare il listener", async () => {
    passwordRecoveryRedirect.active = true;
    const session = { access_token: "token", user: { id: "recovery-user" } } as Session;
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session }, error: null } as never);
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useAdminDashboard(), { wrapper });
    await waitFor(() => expect(result.current.recoveringPassword).toBe(true));
    expect(adminApi.getCurrentAdmin).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("service:password-recovery-user")).toBe("recovery-user");
  });

  it("mostra il recupero anche dopo aver ricaricato la pagina e lo conclude con la nuova password", async () => {
    const session = { access_token: "token", user: { id: "recovery-user" } } as Session;
    sessionStorage.setItem("service:password-recovery-user", session.user.id);
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session }, error: null } as never);
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useAdminDashboard(), { wrapper });
    await waitFor(() => expect(result.current.recoveringPassword).toBe(true));
    expect(adminApi.getCurrentAdmin).not.toHaveBeenCalled();
    await act(() => result.current.resetPassword("new-password"));
    expect(adminApi.updatePassword).toHaveBeenCalledWith("new-password");
    expect(adminApi.logout).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem("service:password-recovery-user")).toBeNull();
    expect(result.current.recoveringPassword).toBe(false);
    expect(result.current.session).toBeNull();
  });

  it("apre la scelta della password quando arriva l'evento di recupero", async () => {
    passwordRecoveryRedirect.invalid = true;
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useAdminDashboard(), { wrapper });
    await waitFor(() => expect(result.current.checkingAuth).toBe(false));
    expect(result.current.error).toContain("Il link di recupero");
    const callback = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0][0];
    await act(async () => { callback("PASSWORD_RECOVERY", { user: { id: "recovery-user" } } as Session); });
    expect(result.current.recoveringPassword).toBe(true);
    expect(result.current.error).toBe("");
    expect(sessionStorage.getItem("service:password-recovery-user")).toBe("recovery-user");
  });

  it("mostra l'errore una volta senza mantenerlo nell'URL o nei tentativi successivi", async () => {
    window.history.replaceState(null, "", "/admin?keep=1#error=access_denied&error_code=otp_expired&error_description=Expired");
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
    const first = renderHook(() => useAdminDashboard(), { wrapper });
    await waitFor(() => expect(first.result.current.checkingAuth).toBe(false));
    expect(first.result.current.error).toContain("Il link di recupero");
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?keep=1");
    first.unmount();
    const second = renderHook(() => useAdminDashboard(), { wrapper });
    await waitFor(() => expect(second.result.current.checkingAuth).toBe(false));
    expect(second.result.current.error).toBe("");
  });

  it("completa il salvataggio anche dopo che React ha rilasciato currentTarget", async () => {
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useAdminDashboard(), { wrapper });
    await waitFor(() => expect(result.current.checkingAuth).toBe(false));
    const form = document.createElement("form");
    form.innerHTML = '<input name="email" value="venditore"><input name="password" value="password"><input name="role" value="seller">';
    const reset = vi.spyOn(form, "reset");
    const event = { preventDefault: vi.fn(), currentTarget: form };
    await act(async () => {
      const pending = result.current.createUser(event as unknown as FormEvent<HTMLFormElement>);
      event.currentTarget = null as unknown as HTMLFormElement;
      await pending;
    });
    expect(adminApi.saveUser).toHaveBeenCalledWith({ email: "venditore", password: "password", active: true, role: "seller" });
    expect(reset).toHaveBeenCalledOnce();
    expect(adminApi.listCars).toHaveBeenCalledOnce();
    expect(result.current.error).toBe("");
  });
});
