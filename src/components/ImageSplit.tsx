import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ImageSplitProps = {
  image: { src: string; alt: string };
  tone?: "dark" | "light";
  /** Immagine a sinistra (default) o a destra su schermi larghi. */
  imageSide?: "left" | "right";
  contentClassName?: string;
  children: ReactNode;
};

/** Riquadro a due colonne con fotografia e contenuto, condiviso dalle sezioni con immagine. */
export function ImageSplit({
  image,
  tone = "dark",
  imageSide = "left",
  contentClassName,
  children,
}: ImageSplitProps) {
  return (
    <article
      className={cn(
        "grid w-full overflow-hidden lg:grid-cols-2",
        tone === "dark" ? "bg-foreground text-background" : "bg-background text-foreground",
      )}
    >
      <div
        className={cn(
          "relative min-h-80 overflow-hidden sm:min-h-100 lg:min-h-140",
          imageSide === "right" && "order-last",
        )}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="absolute inset-0 size-full object-cover object-[68%_center] transition-transform duration-700 hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-foreground/30 to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-foreground/20"
        />
      </div>
      <div className={cn("flex items-center", contentClassName)}>{children}</div>
    </article>
  );
}
