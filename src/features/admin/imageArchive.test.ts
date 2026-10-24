import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), storageFrom: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { rpc: mocks.rpc, storage: { from: mocks.storageFrom } } }));
vi.mock("./prepareImage", () => ({ prepareImageForUpload: vi.fn(async (file: File) => file), createThumbnail: vi.fn(async () => null) }));
import { attachArchivedImage } from "./imageArchive";

describe("Associazione foto dall’archivio", () => {
  const image = { id: "archive-id", storage_path: "original.jpg", caption: "Volvo", received_at: "2026-10-21", previewUrl: "/preview" };
  const download = vi.fn();
  const upload = vi.fn();
  const removeSource = vi.fn();
  const removeTarget = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    download.mockResolvedValue({ data: new Blob(["photo"], { type: "image/jpeg" }), error: null });
    upload.mockResolvedValue({ error: null });
    removeSource.mockResolvedValue({ error: null });
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.storageFrom.mockImplementation((bucket) => bucket === "image-archive" ? { download, remove: removeSource } : { upload, remove: removeTarget });
  });
  it("rimuove l’originale solo dopo la transazione riuscita", async () => {
    await attachArchivedImage(image, "car-id");
    expect(mocks.rpc).toHaveBeenCalledWith("staff_attach_archive_image", expect.objectContaining({ p_archive_id: image.id, p_car_id: "car-id" }));
    expect(removeSource).toHaveBeenCalledWith(["original.jpg"]);
    expect(mocks.rpc.mock.invocationCallOrder[0]).toBeLessThan(removeSource.mock.invocationCallOrder[0]);
  });
  it("conserva l’originale se il caricamento sull’auto fallisce", async () => {
    upload.mockResolvedValue({ error: { message: "Upload fallito" } });
    await expect(attachArchivedImage(image, "car-id")).rejects.toThrow("Upload fallito");
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(removeSource).not.toHaveBeenCalled();
  });
  it("non elimina file potenzialmente associati quando la risposta della transazione è ambigua", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "Connessione interrotta" } });
    await expect(attachArchivedImage(image, "car-id")).rejects.toThrow("Connessione interrotta");
    expect(removeSource).not.toHaveBeenCalled();
    expect(removeTarget).not.toHaveBeenCalled();
  });
});
