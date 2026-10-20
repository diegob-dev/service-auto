import type { CarWithImages } from "@/features/cars/types";
import * as adminApi from "./api";

let started = false;

/**
 * Le foto caricate prima delle miniature non ne hanno una: quando lo staff apre il
 * pannello, il browser le crea in background, una alla volta, senza mostrare nulla.
 * Parte al massimo una volta per pagina; ciò che non riesce verrà ritentato al
 * prossimo accesso.
 */
export function backfillMissingThumbnails(cars: CarWithImages[]) {
  if (started) return;
  const images = cars
    .flatMap((car) => car.car_images)
    // Se la colonna non esiste ancora (migrazione non applicata) non c'è nulla da fare.
    .filter((image) => "thumbnail_path" in image && !image.thumbnail_path);
  if (!images.length) return;

  started = true;
  void (async () => {
    for (const image of images) {
      try {
        const created = await adminApi.addMissingThumbnail(image);
        // Il browser non sa generare miniature: inutile proseguire con le altre.
        if (!created) return;
      } catch {
        // Errore su una singola foto: si passa alla successiva.
      }
    }
  })();
}

/** Solo per i test. */
export function resetThumbnailBackfill() {
  started = false;
}
