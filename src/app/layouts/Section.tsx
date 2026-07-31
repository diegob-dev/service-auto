import { Container, type ContainerProps } from "./Container";
import { cn } from "@/lib/utils";

type SectionProps = {
  tone?: "light" | "dark";
  children: React.ReactNode;
  height?: "sm" | "md" | "lg";
  size?: ContainerProps["size"];
} & React.ComponentProps<"section">;

const paddingClasses = {
  sm: "py-5 md:py-10",
  md: "py-10 md:py-15",
  lg: "py-15 md:py-20",
};

export const Section = ({
  tone = "light",
  children,
  height = "sm",
  size = "default",
  className,
  ...props
}: SectionProps) => {
  const toneClass =
    tone === "light"
      ? "bg-background text-foreground"
      : "bg-foreground text-background";

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
      <Container size={size}>{children}</Container>
    </section>
  );
};
