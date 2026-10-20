import { ButtonLink } from "@/components/ui/button-link";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";
import { ImageSplit } from "./ImageSplit";

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
    <ImageSplit image={image} tone={tone} contentClassName="p-7 sm:p-10 lg:p-14 xl:p-16">
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
    </ImageSplit>
  );
};
