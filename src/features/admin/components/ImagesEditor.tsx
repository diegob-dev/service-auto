import { useState, type FormEvent } from "react";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";
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
    <section>
      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-xl font-bold"><ImagePlus /> Fotografie dell’auto</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          La copertina è la fotografia mostrata nell’elenco delle auto usate.
        </p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {car.car_images?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {car.car_images.map((image) => (
            <article key={image.id} className={`overflow-hidden rounded-xl border bg-card ${image.is_cover ? "ring-2 ring-primary" : ""}`}>
              <div className="relative">
                <img src={getCarImageUrl(image.storage_path)} alt={image.alt} className="aspect-video w-full object-cover" />
                {image.is_cover && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow">
                    <Star size={14} className="fill-current" aria-hidden="true" /> Copertina attuale
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  className="absolute right-2 top-2 bg-black/65 text-white shadow hover:bg-red-600 hover:text-white"
                  aria-label={`Elimina ${image.alt || "immagine"}`}
                  title="Elimina fotografia"
                  onClick={() => void updateImage("delete", image.id)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
              <div className="p-3">
                <p className="truncate text-sm text-muted-foreground">
                  {image.alt || `${car.brand} ${car.model}`}
                </p>
                <label className={`mt-3 flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm font-semibold transition-colors ${image.is_cover ? "border-primary bg-primary/10 text-primary-dark" : "hover:bg-muted"}`}>
                  <input
                    type="radio"
                    name="current-cover"
                    checked={image.is_cover}
                    disabled={busy}
                    aria-label={`Usa come copertina: ${image.alt || "immagine"}`}
                    onChange={() => {
                      if (!image.is_cover) void updateImage("cover", image.id);
                    }}
                  />
                  {image.is_cover ? "Copertina selezionata" : "Usa come copertina"}
                </label>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          <ImagePlus className="mx-auto mb-2" aria-hidden="true" />
          <p className="font-semibold text-foreground">Nessuna fotografia caricata</p>
          <p className="mt-1 text-sm">La prima fotografia verrà usata automaticamente come copertina.</p>
        </div>
      )}

      <form className="mt-6 rounded-xl bg-muted p-5" onSubmit={upload}>
        <h4 className="flex items-center gap-2 font-bold"><Upload size={18} /> Aggiungi una fotografia</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Scegli immagine
            <input className={`${adminInputClass} mt-1 cursor-pointer`} name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">JPG, PNG, WebP o AVIF, massimo 10 MB.</span>
          </label>
          <label className="text-sm font-semibold">
            Descrizione dell’immagine
            <input className={`${adminInputClass} mt-1`} name="alt" placeholder={`${car.brand} ${car.model}`} />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">Aiuta a descrivere la fotografia anche a chi non può vederla.</span>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="cover" defaultChecked={!car.car_images?.length} /> Usa come copertina
          </label>
          <Button type="submit" disabled={busy}>
            <Upload aria-hidden="true" /> {busy ? "Caricamento…" : "Carica fotografia"}
          </Button>
        </div>
      </form>
    </section>
  );
}
