import { describe, expect, it, vi } from "vitest";
import { adminAuthEmail } from "../../../supabase/functions/_shared/admin-identity";
import { login } from "./api";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: { auth: { signInWithPassword: vi.fn(async () => ({
    data: { session: { access_token: "test-session" } }, error: null,
  })) } },
}));

describe("Admin identity", () => {
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
