import { useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCarThumbnailUrl } from "@/features/cars/api";
import * as adminApi from "../api";
import { createThumbnail, prepareImageForUpload } from "../prepareImage";
import { adminInputClass } from "../constants";
import type { CarInput } from "../types";

type ImagesEditorProps = {
  car: CarInput & { id: string };
  onChanged: () => Promise<void>;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function ImagesEditor({ car, onChanged }: ImagesEditorProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const imageCount = car.car_images?.length ?? 0;

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const files = form
      .getAll("image")
      .filter((value): value is File => value instanceof File && value.size > 0);
    if (!files.length) return;

    const invalid = files.find((file) => !ALLOWED_TYPES.includes(file.type));
    if (invalid) {
      setError(`“${invalid.name}” non è in formato JPG, PNG, WebP o AVIF.`);
      return;
    }

    const alt = String(form.get("alt") ?? "").trim();
    const coverRequested = form.get("cover") === "on";
    const failures: string[] = [];
    setBusy(true);
    setError("");
    try {
      for (const [index, file] of files.entries()) {
        setProgress(files.length > 1 ? `Caricamento ${index + 1} di ${files.length}…` : "Caricamento…");
        try {
          // Le foto vengono ridotte nel browser: il catalogo pubblico non scarica file da diversi MB.
          const preparedFile = await prepareImageForUpload(file);
          if (preparedFile.size > MAX_UPLOAD_BYTES) {
            failures.push(`${file.name}: supera il limite di 10 MB`);
            continue;
          }
          const thumbnail = await createThumbnail(preparedFile);
          await adminApi.uploadCarImage(car.id, preparedFile, alt, coverRequested && index === 0, thumbnail);
        } catch (caught) {
          failures.push(`${file.name}: ${caught instanceof Error ? caught.message : "caricamento non riuscito"}`);
        }
      }
      if (failures.length) {
        setError(
          files.length === 1
            ? `Caricamento non riuscito. ${failures[0]}`
            : `${failures.length} foto su ${files.length} non sono state caricate. ${failures.join(" · ")}`,
        );
      } else {
        formElement.reset();
      }
    } finally {
      try {
        await onChanged();
      } catch {
        // Conserva l'errore originale, ma mostra le immagini già salvate quando possibile.
      }
      setProgress("");
      setBusy(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const images = [...(car.car_images ?? [])];
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];

    setBusy(true);
    setError("");
    try {
      await adminApi.reorderCarImages(images);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ordine non salvato");
    } finally {
      try {
        await onChanged();
      } catch {
        // Riallinea la UI quando possibile.
      }
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
      try {
        await onChanged();
      } catch {
        // Conserva l'errore originale, ma riallinea la UI quando possibile.
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-xl font-bold"><ImagePlus /> Fotografie dell’auto</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          La copertina è la fotografia mostrata nell’elenco delle auto usate. Con le frecce scegli l’ordine delle altre foto nella scheda.
        </p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {car.car_images?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {car.car_images.map((image, index) => (
            <article key={image.id} className={`overflow-hidden rounded-xl border bg-card ${image.is_cover ? "ring-2 ring-primary" : ""}`}>
              <div className="relative">
                <img src={getCarThumbnailUrl(image)} alt={image.alt} className="aspect-video w-full object-cover" />
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
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Foto {index + 1}</span> · {image.alt || `${car.brand} ${car.model}`}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={busy || index === 0}
                      aria-label={`Sposta prima la foto ${index + 1}`}
                      title="Sposta prima"
                      onClick={() => void move(index, -1)}
                    >
                      <ChevronLeft aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={busy || index === imageCount - 1}
                      aria-label={`Sposta dopo la foto ${index + 1}`}
                      title="Sposta dopo"
                      onClick={() => void move(index, 1)}
                    >
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </div>
                </div>
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
        <h4 className="flex items-center gap-2 font-bold"><Upload size={18} aria-hidden="true" /> Aggiungi fotografie</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Scegli immagini
            <input className={`${adminInputClass} mt-1 cursor-pointer`} name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple required />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">Puoi selezionarne più di una. JPG, PNG, WebP o AVIF; le foto grandi vengono ridotte automaticamente.</span>
          </label>
          <label className="text-sm font-semibold">
            Descrizione dell’immagine
            <input className={`${adminInputClass} mt-1`} name="alt" placeholder={`${car.brand} ${car.model}`} />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">Aiuta a descrivere la fotografia anche a chi non può vederla. Con più foto vale per tutte.</span>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="cover" defaultChecked={!car.car_images?.length} /> Usa come copertina (la prima selezionata)
          </label>
          <Button type="submit" disabled={busy}>
            <Upload aria-hidden="true" /> {busy ? progress || "Attendere…" : "Carica fotografie"}
          </Button>
        </div>
      </form>
    </section>
  );
}
