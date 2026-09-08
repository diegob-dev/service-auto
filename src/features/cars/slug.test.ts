import { describe, expect, it } from "vitest";
import { buildCarSlug } from "./slug";

describe("buildCarSlug", () => {
  it("crea uno slug leggibile dai dati dell'auto", () => {
    expect(buildCarSlug({
      brand: "Škoda",
      model: "Karoq",
      version: "2.0 TDI 4×4",
      year: 2024,
    })).toBe("skoda-karoq-2-0-tdi-4-4-2024");
  });

  it("usa un valore sicuro quando i dati non sono ancora compilati", () => {
    expect(buildCarSlug({ brand: "", model: "" })).toBe("auto-usata");
  });
});
