import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
};

type FeatureGridProps = {
  features: Feature[];
  gap?: "auto" | "none" | "sm" | "md";
};

const gapClasses = {
  none: "gap-px overflow-hidden rounded-2xl border border-border bg-border",
  sm: "gap-3 bg-transparent",
  md: "gap-6 bg-transparent",
};

export function FeatureGrid({ features, gap = "auto" }: FeatureGridProps) {
  const hasImages = features.some(({ image }) => Boolean(image));
  const resolvedGap = gap === "auto" ? (hasImages ? "md" : "none") : gap;
  const cardsAreSeparated = resolvedGap !== "none";

  return (
    <div
      className={cn(
        "grid",
        cardsAreSeparated
          ? "sm:grid-cols-2 xl:grid-cols-4"
          : "sm:grid-cols-3",
        gapClasses[resolvedGap],
      )}
    >
      {features.map(({ title, description, icon: Icon, image }) => (
        <article
          key={title}
          className={cn(
            "overflow-hidden bg-card",
            cardsAreSeparated && "rounded-2xl border border-border shadow-sm",
          )}
        >
          {image && (
            <img
              src={image}
              alt={title}
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
          )}
          <div className="p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl tracking-wide uppercase">
                {title}
              </h2>
            </div>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
