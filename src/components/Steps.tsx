import { cn } from "@/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";

export type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type StepProps = {
  steps: Step[];
  tone?: "dark" | "light";
};

export const Steps = ({ steps, tone = "light" }: StepProps) => {
  const isDark = tone === "dark";

  return (
    <ol className="grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
      {steps.map(({ icon: Icon, title, description }, index) => (
        <li
          key={title}
          className={cn(
            "relative flex flex-col items-center px-5 text-center",
            isDark ? "text-background" : "text-foreground",
          )}
        >
          <div className="flex items-center justify-center gap-7">
            <span
              className={cn(
                "font-display text-5xl leading-none tabular-nums sm:text-6xl",
                isDark ? "text-primary" : "text-primary-dark",
              )}
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <Icon
              className={cn(
                "size-12 stroke-[1.7] sm:size-14",
                isDark ? "text-primary" : "text-primary-dark",
              )}
              aria-hidden="true"
            />
          </div>

          <h3
            className={cn(
              "mt-5 font-display text-2xl leading-tight tracking-wide uppercase",
              isDark ? "text-background" : "text-foreground",
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "mt-3 max-w-64 text-md leading-relaxed",
              isDark ? "text-secondary-foreground/75" : "text-muted-foreground",
            )}
          >
            {description}
          </p>

          {index < steps.length - 1 && (
            <ChevronRight
              className={cn(
                "absolute top-7 right-0 hidden size-7 translate-x-1/2 xl:block",
                isDark ? "text-background/50" : "text-primary-dark",
              )}
              aria-hidden="true"
            />
          )}
        </li>
      ))}
    </ol>
  );
};
