import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TitleProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center" | "right";
  margin?: "none" | "xs" | "sm" | "md" | "default";
  showLines?: boolean;
  tone?: "light" | "dark";
};

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  showLines,
  align = "left",
  margin = "default",
  tone = "light",
}: TitleProps) => {
  const containerStyle = {
    left: "max-w-2xl mr-auto",
    center: "max-w-2xl mx-auto",
    right: "max-w-2xl ml-auto",
  };

  const marginStyle = {
    none: "none",
    xs: "mb-4",
    sm: "mb-8",
    md: "mb-10",
    default: "mb-12",
  };

  const textStyle = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={`${marginStyle[margin]} ${containerStyle[align]}`}>
      {eyebrow && (
        <p
          className={cn(
            "text-sm font-semibold tracking-[0.2em] uppercase",
            tone === "dark" ? "text-primary" : "text-primary-dark",
            textStyle[align],
          )}
        >
          {eyebrow}
        </p>
      )}
      {showLines ? (
        <div className="mt-3 flex w-full items-center gap-4 sm:gap-6">
          <span
            aria-hidden="true"
            className="h-0.5 min-w-8 flex-1 bg-primary"
          />

          <h2
            className={`shrink-0 font-display text-4xl tracking-wide uppercase sm:text-5xl ${textStyle[align]}`}
          >
            {title}
          </h2>

          <span
            aria-hidden="true"
            className="h-0.5 min-w-8 flex-1 bg-primary"
          />
        </div>
      ) : (
        <h2
          className={`mt-3 font-display text-4xl tracking-wide uppercase sm:text-5xl ${textStyle[align]}`}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className={cn(
            "mt-3 text-lg leading-relaxed",
            tone === "dark"
              ? "text-secondary-foreground/80"
              : "text-muted-foreground",
            textStyle[align],
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
