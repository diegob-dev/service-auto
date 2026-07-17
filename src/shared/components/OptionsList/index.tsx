import { Button } from "@/components/ui/button";
import { IconsListCard } from "@/pages/homepage/components/IconsListCard";
import { type JSX } from "react";

export interface OptionsListProps {
  icons: { title: string; description: string; icon: React.ReactNode }[];
  title?: string | JSX.Element;
  primaryButton?: string;
  secondaryButton?: string;
  primaryButtonClick?: () => void;
  secondaryButtonClick?: () => void;
  variant?: "dark" | "light";
}

export const OptionsList = ({
  icons,
  title,
  primaryButton,
  secondaryButton,
  primaryButtonClick,
  secondaryButtonClick,
  variant = "dark",
}: OptionsListProps) => {
  const containerClassName =
    variant === "dark" ? "text-secondary-foreground" : " text-foreground";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-8 py-3 ${containerClassName}`}
    >
      {title && (
        <h2 className="tracking-tight text-4xl mb-4 uppercase">{title}</h2>
      )}
      <IconsListCard icons={icons} variant={variant} />
      {primaryButton && (
        <Button variant="default" size="lg" onClick={primaryButtonClick}>
          {primaryButton}
        </Button>
      )}
      {secondaryButton && (
        <Button variant="outline" size="lg" onClick={secondaryButtonClick}>
          {secondaryButton}
        </Button>
      )}
    </div>
  );
};
