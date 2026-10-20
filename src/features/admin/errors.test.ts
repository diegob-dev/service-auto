import { describe, expect, it } from "vitest";
import { translateError } from "./errors";

describe("translateError", () => {
  it("traduce i messaggi comuni di Supabase", () => {
    expect(translateError("Invalid login credentials")).toBe("Username, email o password non corretti.");
    expect(translateError('duplicate key value violates unique constraint "cars_slug_key" (slug)')).toContain("indirizzo di pagina");
    expect(translateError("new row violates row-level security policy for table \"cars\"")).toBe("Non hai i permessi per questa operazione.");
    expect(translateError("A user with this email address has already been registered")).toBe("Esiste già un utente con questa email.");
    expect(translateError("TypeError: Failed to fetch")).toContain("Connessione non riuscita");
  });

  it("lascia invariati i messaggi già in italiano", () => {
    expect(translateError("Non puoi eliminare il tuo account")).toBe("Non puoi eliminare il tuo account");
  });
});
