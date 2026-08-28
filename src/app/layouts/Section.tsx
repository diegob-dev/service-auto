import { Container, type ContainerProps } from "./Container";
import { cn } from "@/lib/utils";

type SectionProps = {
  tone?: "light" | "dark" | "primary";
  children: React.ReactNode;
  height?: "none" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  size?: ContainerProps["size"];
} & React.ComponentProps<"section">;

const paddingClasses = {
  none: "",
  sm: "py-10",
  md: "py-15",
  lg: "py-20",
};

export const Section = ({
  tone = "light",
  children,
  height = "sm",
  fullWidth = false,
  size = "default",
  className,
  ...props
}: SectionProps) => {
  const toneClass =
    tone === "light"
      ? "bg-background text-foreground"
      : tone === "dark"
        ? "bg-foreground text-background"
        : "bg-primary-dark text-background";

  return (
    <section
      className={cn(
        toneClass,
        paddingClasses[height],
        "flex w-full items-center justify-center",
        className,
      )}
      {...props}
    >
      {fullWidth ? children : <Container size={size}>{children}</Container>}
    </section>
  );
};
