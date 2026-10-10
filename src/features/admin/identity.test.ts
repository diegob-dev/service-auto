import { describe, expect, it, vi } from "vitest";
import { adminAuthEmail, recoveryEmail } from "../../../supabase/functions/_shared/admin-identity";
import { login, requestPasswordReset } from "./api";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: { auth: { signInWithPassword: vi.fn(async () => ({
    data: { session: { access_token: "test-session" } }, error: null,
  })), resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })) } },
}));

describe("Admin identity", () => {
  it("manda il recupero alla mail reale e torna all'area riservata del sito aperto", async () => {
    await requestPasswordReset(" Utente@example.com ");
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenLastCalledWith("utente@example.com", { redirectTo: `${window.location.origin}/admin` });
  });

  it("non manda link di recupero a username o indirizzi tecnici", async () => {
    const calls = vi.mocked(supabase.auth.resetPasswordForEmail).mock.calls.length;
    await expect(requestPasswordReset("venditore")).rejects.toThrow("email reale");
    await expect(requestPasswordReset("utente@admin.service.invalid")).rejects.toThrow("email reale");
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledTimes(calls);
    expect(recoveryEmail(" UTENTE@example.com ")).toBe("utente@example.com");
  });

  it("preserva gli account email esistenti", async () => {
    await login(" DiegoBellazzi@gmail.com ", "user");
    expect(supabase.auth.signInWithPassword).toHaveBeenLastCalledWith({
      email: "diegobellazzi@gmail.com", password: "user",
    });
  });

  it("usa la stessa identità per creazione e login con username", async () => {
    await login(" User ", "user");
    expect(supabase.auth.signInWithPassword).toHaveBeenLastCalledWith({
      email: adminAuthEmail("user"), password: "user",
    });
    expect(adminAuthEmail("user")).toBe("75736572@admin.service.invalid");
  });

  it("non confonde username diversi né elimina la punteggiatura", () => {
    expect(adminAuthEmail("user.name")).not.toBe(adminAuthEmail("username"));
    expect(adminAuthEmail("utente è")).not.toBe(adminAuthEmail("utente e"));
    expect(() => adminAuthEmail("   ")).toThrow("Username o email obbligatorio");
  });
});
