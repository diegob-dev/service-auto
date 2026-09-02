import { useState, type FormEvent } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCarImageUrl } from "@/features/cars/api";
import * as adminApi from "../api";
import { adminInputClass } from "../constants";
import type { CarInput } from "../types";

type ImagesEditorProps = {
  car: CarInput & { id: string };
  onChanged: () => Promise<void>;
};

export function ImagesEditor({ car, onChanged }: ImagesEditorProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("image");
    if (!(file instanceof File) || !file.size) return;

    setBusy(true);
    setError("");
    try {
      await adminApi.uploadCarImage(
        car.id,
        file,
        String(form.get("alt") ?? ""),
        form.get("cover") === "on",
      );
      event.currentTarget.reset();
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Caricamento non riuscito");
    } finally {
      setBusy(false);
    }
  }

  async function updateImage(action: "cover" | "delete", imageId: string) {
    if (action === "delete" && !window.confirm("Eliminare questa immagine?")) return;

    setBusy(true);
    setError("");
    try {
      const image = car.car_images?.find(({ id }) => id === imageId);
      if (!image) return;
      if (action === "cover") await adminApi.setCoverImage(image);
      else await adminApi.deleteCarImage(image);
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Aggiornamento non riuscito");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 border-t pt-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><ImagePlus /> Immagini</h3>
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {car.car_images?.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-lg border">
            <img src={getCarImageUrl(image.storage_path)} alt={image.alt} className="aspect-video w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-2">
              <span className="truncate text-xs">{image.is_cover ? "Copertina" : image.alt || "Immagine"}</span>
              <div className="flex">
                <Button type="button" variant="ghost" size="icon" disabled={busy || image.is_cover} aria-label="Imposta come copertina" onClick={() => void updateImage("cover", image.id)}><Star /></Button>
                <Button type="button" variant="ghost" size="icon" disabled={busy} className="text-red-600" aria-label="Elimina immagine" onClick={() => void updateImage("delete", image.id)}><Trash2 /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={upload}>
        <label className="text-sm font-semibold">
          File immagine
          <input className={`${adminInputClass} mt-1`} name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
        </label>
        <label className="text-sm font-semibold">
          Testo alternativo
          <input className={`${adminInputClass} mt-1`} name="alt" placeholder={`${car.brand} ${car.model}`} />
        </label>
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="cover" defaultChecked={!car.car_images?.length} /> Copertina
          </label>
          <Button type="submit" disabled={busy}>{busy ? "Caricamento…" : "Carica"}</Button>
        </div>
      </form>
    </section>
  );
}
