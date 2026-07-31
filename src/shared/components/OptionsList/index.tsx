import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { IconsListCard } from "@/pages/homepage/components/IconsListCard";
import { SectionTitle } from "@/shared/components/SectionTitle";
import type { ReactNode } from "react";

export interface OptionsListProps {
  icons: { title: string; description: string; icon: React.ReactNode }[];
  title?: ReactNode;
  primaryButton?: string;
  secondaryButton?: string;
  primaryButtonClick?: () => void;
  secondaryButtonClick?: () => void;
  primaryButtonHref?: string;
  secondaryButtonHref?: string;
  variant?: "dark" | "light";
}

export const OptionsList = ({
  icons,
  title,
  primaryButton,
  secondaryButton,
  primaryButtonClick,
  secondaryButtonClick,
  primaryButtonHref,
  secondaryButtonHref,
  variant = "dark",
}: OptionsListProps) => {
  const containerClassName =
    variant === "dark" ? "text-secondary-foreground" : " text-foreground";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-8 py-3 ${containerClassName}`}
    >
      {title && <SectionTitle>{title}</SectionTitle>}
      <IconsListCard icons={icons} variant={variant} />
      {primaryButton && primaryButtonHref ? (
        <ButtonLink to={primaryButtonHref} size="lg">
          {primaryButton}
        </ButtonLink>
      ) : primaryButton ? (
        <Button
          variant="default"
          size="lg"
          onClick={primaryButtonClick}
        >
          {primaryButton}
        </Button>
      ) : null}
      {secondaryButton && secondaryButtonHref ? (
        <ButtonLink to={secondaryButtonHref} variant="outline" size="lg">
          {secondaryButton}
        </ButtonLink>
      ) : secondaryButton ? (
        <Button
          variant="outline"
          size="lg"
          onClick={secondaryButtonClick}
        >
          {secondaryButton}
        </Button>
      ) : null}
    </div>
  );
};
