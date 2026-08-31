import { Section } from "@/app/layouts/Section";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type CallToActionProps = {
  tone?: "primary" | "dark" | "light";
  title: string;
  subtitle?: string;
  button?: string;
  buttonTo?: string;
  eyebrow?: string;
  icon?: LucideIcon;
};

export function CallToAction({
  tone = "primary",
  title,
  subtitle,
  button,
  buttonTo = "/contatti",
  eyebrow,
  icon: Icon,
}: CallToActionProps) {
  const isDark = tone === "dark";
  const isPrimary = tone === "primary";

  return (
    <Section tone={tone} height="md">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col md:flex-row max-w-3xl items-center gap-5 sm:gap-8 lg:gap-10">
          {Icon && (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl",
                isPrimary
                  ? "text-background"
                  : isDark
                    ? " text-primary"
                    : "text-primary-dark",
              )}
            >
              <Icon
                className="size-14 sm:size-18 lg:size-22"
                aria-hidden="true"
              />
            </div>
          )}

          <div>
            {eyebrow && (
              <p
                className={cn(
                  "mb-2 text-sm font-semibold tracking-[0.2em] uppercase",
                  isPrimary
                    ? "text-background/75"
                    : isDark
                      ? "text-primary"
                      : "text-primary-dark",
                )}
              >
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-4xl tracking-wide uppercase sm:text-5xl text-center md:text-left">
              {title}
            </h2>
            {subtitle && (
              <p
                className={cn(
                  "mt-2 text-lg leading-relaxed sm:text-xl text-center md:text-left",
                  isPrimary
                    ? "text-background/80"
                    : isDark
                      ? "text-secondary-foreground/75"
                      : "text-muted-foreground",
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <ButtonLink
          className={cn(
            "shrink-0  px-15",
            isPrimary ? "border-2 border-background" : "",
          )}
          variant={"default"}
          size="lg"
          to={buttonTo}
        >
          {button || "Contattaci"}
        </ButtonLink>
      </div>
    </Section>
  );
}
