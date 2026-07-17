import { Container, type ContainerProps } from "./Container";

type SectionProps = {
  tone?: "light" | "dark";
  children: React.ReactNode;
  height?: "sm" | "md" | "lg";
  size?: ContainerProps["size"];
} & React.ComponentProps<"div">;

export const Section = ({
  tone = "light",
  children,
  height,
  size = "default",
  ...props
}: SectionProps) => {
  const toneClass =
    tone === "light"
      ? "bg-background text-foreground"
      : "bg-foreground text-background py-8";

  return (
    <div
      className={`${toneClass} flex items-center justify-center w-full mt-8 `}
      {...props}
    >
      <Container size={size}>{children}</Container>
    </div>
  );
};
