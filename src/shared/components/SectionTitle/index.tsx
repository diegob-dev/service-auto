import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function SectionTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "mb-4 font-display text-4xl leading-none tracking-wide uppercase sm:text-4xl",
        className,
      )}
      {...props}
    />
  );
}
