import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setPageMetadata } from "./pageMetadata";

describe("indicizzazione delle pagine", () => {
  let originalHead: string;
  beforeEach(() => {
    originalHead = document.head.innerHTML;
    document.head.innerHTML = "";
  });
  afterEach(() => {
    document.head.innerHTML = originalHead;
    vi.unstubAllEnvs();
  });

  it("usa il dominio definitivo anche quando la pagina è aperta in un'anteprima", () => {
    vi.stubEnv("VITE_SITE_URL", "https://service.example");
    setPageMetadata("Contatti", "Come raggiungerci", true, "/contatti");
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://service.example/contatti");
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  });

  it("rimuove i riferimenti pubblici quando si entra nell'area riservata", () => {
    vi.stubEnv("VITE_SITE_URL", "https://service.example");
    setPageMetadata("Contatti", "Come raggiungerci", true, "/contatti");
    setPageMetadata("Area riservata", "Accesso", false, "/admin");
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  });

  it("esclude le pagine dall'indicizzazione finché il dominio non è configurato", () => {
    vi.stubEnv("VITE_SITE_URL", "");
    setPageMetadata("Home", "Officina", true, "/");
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it("mantiene esclusi i deploy di anteprima anche con il dominio configurato", () => {
    vi.stubEnv("VITE_SITE_URL", "https://servicevigevano.store");
    vi.stubEnv("VITE_SITE_INDEXABLE", "false");
    setPageMetadata("Home", "Officina", true, "/");
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it("elimina foto e dati dell'annuncio quando si passa a una pagina generale", () => {
    vi.stubEnv("VITE_SITE_URL", "https://service.example");
    setPageMetadata("Volvo usata", "Scheda auto", true, "/auto-usate/volvo", {
      image: "https://images.example/volvo.jpg",
      structuredData: { "@type": "Car", name: "Volvo </script>" },
    });
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute("content", "https://images.example/volvo.jpg");
    expect(document.getElementById("car-structured-data")?.textContent).not.toContain("</script>");
    setPageMetadata("Officina", "Servizi", true, "/officina");
    expect(document.getElementById("car-structured-data")).toBeNull();
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute("content", "https://service.example/og-image.jpg");
    expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute("content", "Officina");
  });
});
