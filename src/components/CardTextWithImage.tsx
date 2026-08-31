import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

type CardTextWithImageProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  options?: string[];
  image: {
    src: string;
    alt: string;
  };
  cta?: {
    label: string;
    to: string;
  };
  tone?: "dark" | "light";
};

export const CardTextWithImage = ({
  eyebrow,
  title,
  description,
  options,
  image,
  cta,
  tone = "dark",
}: CardTextWithImageProps) => {
  const isDark = tone === "dark";
  return (
    <article
      className={cn(
        "grid w-full overflow-hidden lg:grid-cols-2",
        isDark
          ? "bg-foreground text-background"
          : "bg-background text-foreground",
      )}
    >
      <div className="relative min-h-80 overflow-hidden sm:min-h-100 lg:min-h-140">
        <img
          src={image.src}
          alt={image.alt}
          className="absolute inset-0 size-full object-cover object-[68%_center] transition-transform duration-700 hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-foreground/30 to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-foreground/20" />
      </div>

      <div className="flex items-center p-7 sm:p-10 lg:p-14 xl:p-16">
        <div className="max-w-xl">
          <SectionHeader
            title={title}
            eyebrow={eyebrow}
            subtitle={description}
            margin="none"
          />
          {options && options.length > 0 && (
            <ul className="mt-7 space-y-4">
              {options.map((option) => (
                <li key={option} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span
                    className={
                      isDark ? "text-background/90" : "text-foreground/90"
                    }
                  >
                    {option}
                  </span>
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
      </div>
    </article>
  );
};
