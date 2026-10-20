import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";
import { ImageSplit } from "./ImageSplit";
import type { LucideIcon } from "lucide-react";

type IconWithImageProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  options?: { icon: LucideIcon; title: string; description: string }[];
  image: {
    src: string;
    alt: string;
  };
  cta?: {
    label: string;
    to: string;
  };
  tone?: "dark" | "light";
  alignText?: "left" | "right";
};

export const IconWithImage = ({
  eyebrow,
  title,
  description,
  options,
  image,
  cta,
  tone = "dark",
  alignText = "right",
}: IconWithImageProps) => {
  const isDark = tone === "dark";
  const textOnRight = alignText === "right";

  return (
    <ImageSplit
      image={image}
      tone={tone}
      imageSide={textOnRight ? "left" : "right"}
      contentClassName="p-7 sm:p-10 lg:p-10 xl:p-14"
    >
      <div className="w-full max-w-2xl">
        <SectionHeader
          title={title}
          eyebrow={eyebrow}
          subtitle={description}
          margin="md"
          tone={tone}
        />
        {options && options.length > 0 && (
          <ul className="grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
            {options.map(({ title, description, icon: Icon }) => (
              <li key={title} className="flex min-w-0 items-start gap-4">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl",
                    isDark
                      ? "bg-primary/15 text-primary"
                      : "bg-primary/10 text-primary-dark",
                  )}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3
                    className={cn(
                      "font-display text-xl leading-tight tracking-wide uppercase",
                      isDark ? "text-background/90" : "text-foreground/90",
                    )}
                  >
                    {title}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 leading-relaxed",
                      isDark
                        ? "text-secondary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {cta && (
          <ButtonLink className="mt-8" size="lg" to={cta.to}>
            {cta.label}
          </ButtonLink>
        )}
      </div>
    </ImageSplit>
  );
};
