import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("catalogo pubblico", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_SUPABASE_URL", "https://progetto.supabase.co/");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("filtra e limita le auto in evidenza quando richiesto", async () => {
    fetchMock.mockResolvedValue(new Response("[]", { status: 200 }));
    const { getPublishedCars } = await import("./api");

    await getPublishedCars({ featuredOnly: true, limit: 3 });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const params = new URL(url).searchParams;
    expect(url.startsWith("https://progetto.supabase.co/rest/v1/cars?")).toBe(true);
    expect(params.get("status")).toBe("eq.published");
    expect(params.get("featured")).toBe("eq.true");
    expect(params.get("limit")).toBe("3");
    expect(params.get("order")).toBe("featured.desc,created_at.desc");
    expect(init.headers).toEqual({ apikey: "sb_publishable_test", Accept: "application/json" });
  });

  it("ordina le immagini per posizione", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify([
      { id: "1", optional_features: null, car_images: [{ id: "b", position: 2 }, { id: "a", position: 0 }] },
    ]), { status: 200 }));
    const { getPublishedCars } = await import("./api");

    const [car] = await getPublishedCars();

    expect(car.optional_features).toEqual([]);
    expect(car.car_images.map(({ id }) => id)).toEqual(["a", "b"]);
  });

  it("segnala gli errori del server", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "boom" }), { status: 500 }));
    const { getPublishedCars } = await import("./api");

    await expect(getPublishedCars()).rejects.toThrow("Impossibile caricare le auto: boom");
  });

  it("costruisce gli URL pubblici di foto e miniature", async () => {
    const { getCarImageUrl, getCarThumbnailUrl } = await import("./api");

    expect(getCarImageUrl("auto/foto 1.webp")).toBe(
      "https://progetto.supabase.co/storage/v1/object/public/car-image/auto/foto%201.webp",
    );
    expect(getCarThumbnailUrl({ storage_path: "auto/a.webp", thumbnail_path: "auto/thumbs/a.webp" })).toContain("/thumbs/a.webp");
    expect(getCarThumbnailUrl({ storage_path: "auto/a.webp", thumbnail_path: null })).toContain("/auto/a.webp");
  });
});
