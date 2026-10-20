import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CarWithImages } from "@/features/cars/types";
import * as adminApi from "./api";
import { backfillMissingThumbnails, resetThumbnailBackfill } from "./thumbnailBackfill";

vi.mock("./api", () => ({ addMissingThumbnail: vi.fn() }));

const image = (id: string, thumbnail_path: string | null) => ({
  id, car_id: "c1", storage_path: `c1/${id}.jpg`, thumbnail_path, alt: "", position: 0, is_cover: false, created_at: "",
});
const cars = [{ car_images: [image("a", null), image("b", "c1/thumbs/b.webp"), image("c", null)] }] as unknown as CarWithImages[];

describe("backfillMissingThumbnails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetThumbnailBackfill();
  });

  it("crea le miniature mancanti una sola volta, anche se una foto fallisce", async () => {
    vi.mocked(adminApi.addMissingThumbnail).mockRejectedValueOnce(new Error("rete")).mockResolvedValue(true);

    backfillMissingThumbnails(cars);
    backfillMissingThumbnails(cars);

    await vi.waitFor(() => expect(adminApi.addMissingThumbnail).toHaveBeenCalledTimes(2));
    expect(vi.mocked(adminApi.addMissingThumbnail).mock.calls.map(([item]) => item.id)).toEqual(["a", "c"]);
  });

  it("non fa nulla se la colonna delle miniature non esiste ancora", () => {
    const legacy = [{ car_images: [{ id: "x", car_id: "c1", storage_path: "c1/x.jpg" }] }] as unknown as CarWithImages[];
    backfillMissingThumbnails(legacy);
    expect(adminApi.addMissingThumbnail).not.toHaveBeenCalled();
  });
});
