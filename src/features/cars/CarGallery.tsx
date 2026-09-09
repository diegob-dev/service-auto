import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCarImageUrl } from "./api";
import type { CarImageRecord } from "./types";

type CarGalleryProps = {
  images: CarImageRecord[];
  carName: string;
};

export function CarGallery({ images, carName }: CarGalleryProps) {
  const orderedImages = useMemo(() => {
    const cover = images.find((image) => image.is_cover);
    return cover
      ? [cover, ...images.filter((image) => image.id !== cover.id)]
      : images;
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const activeImage = orderedImages[activeIndex];
  const fullscreenImage =
    fullscreenIndex == null ? null : orderedImages[fullscreenIndex];

  useEffect(() => {
    if (fullscreenIndex == null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreenIndex(null);
      if (event.key === "ArrowLeft") {
        setFullscreenIndex((current) =>
          current == null
            ? null
            : (current - 1 + orderedImages.length) % orderedImages.length,
        );
      }
      if (event.key === "ArrowRight") {
        setFullscreenIndex((current) =>
          current == null ? null : (current + 1) % orderedImages.length,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreenIndex, orderedImages.length]);

  if (!activeImage) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        Immagine non disponibile
      </div>
    );
  }

  const showPrevious = () =>
    setFullscreenIndex((current) =>
      current == null
        ? null
        : (current - 1 + orderedImages.length) % orderedImages.length,
    );
  const showNext = () =>
    setFullscreenIndex((current) =>
      current == null ? null : (current + 1) % orderedImages.length,
    );

  return (
    <section aria-label={`Galleria fotografica ${carName}`}>
      <button
        type="button"
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-black text-left shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
        aria-label={`Apri ${activeImage.alt || carName} a tutto schermo`}
        onClick={() => setFullscreenIndex(activeIndex)}
      >
        <img
          src={getCarImageUrl(activeImage.storage_path)}
          alt={activeImage.alt || carName}
          className="max-h-[72vh] min-h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.015] sm:aspect-video"
        />
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
          <Expand size={17} aria-hidden="true" /> Apri a tutto schermo
        </span>
        {orderedImages.length > 1 && (
          <span className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            {activeIndex + 1} / {orderedImages.length}
          </span>
        )}
      </button>

      {orderedImages.length > 1 && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
          aria-label="Seleziona fotografia"
        >
          {orderedImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${index === activeIndex ? "border-primary shadow-md" : "border-transparent opacity-75 hover:opacity-100"}`}
              aria-label={`Mostra fotografia ${index + 1}: ${image.alt || carName}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
            >
              <img
                src={getCarImageUrl(image.storage_path)}
                alt=""
                className="aspect-video w-32 object-cover sm:w-40"
              />
            </button>
          ))}
        </div>
      )}

      {fullscreenImage && fullscreenIndex != null && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Fotografia a tutto schermo di ${carName}`}
          onClick={() => setFullscreenIndex(null)}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="absolute right-4 top-4 z-10 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            aria-label="Chiudi visualizzazione a tutto schermo"
            onClick={() => setFullscreenIndex(null)}
          >
            <X />
          </Button>
          {orderedImages.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 z-20 flex size-12 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 hover:scale-105 hover:border-white/35 hover:bg-black/70 hover:shadow-md active:scale-98 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 sm:left-6"
                aria-label="Fotografia precedente"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
              >
                <ChevronLeft className="pointer-events-none" />
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 z-20 flex size-12 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 hover:scale-105 hover:border-white/35 hover:bg-black/70 hover:shadow-md active:scale-98 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 sm:right-6"
                aria-label="Fotografia successiva"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
              >
                <ChevronRight className="pointer-events-none" />
              </button>
            </>
          )}
          <figure className="flex h-full w-full flex-col items-center justify-center">
            <img
              src={getCarImageUrl(fullscreenImage.storage_path)}
              alt={fullscreenImage.alt || carName}
              className="max-h-[calc(100vh-8rem)] max-w-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
            <figcaption className="mt-4 text-center text-sm text-white/80">
              {fullscreenImage.alt || carName}
              {orderedImages.length > 1 && (
                <span className="ml-3 text-white/55">
                  {fullscreenIndex + 1} / {orderedImages.length}
                </span>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
