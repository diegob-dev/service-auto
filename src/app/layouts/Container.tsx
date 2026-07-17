export type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "large";
};

const maxWidths = {
  default: "max-w-360 px-4 sm:px-6 lg:px-8",
  large: "max-w-500 px-4 sm:px-6 lg:px-8",
};

export function Container({
  children,
  className = "",
  size = "default",
}: ContainerProps) {
  return (
    <div className={`mx-auto w-full ${maxWidths[size]} ${className}`}>
      {children}
    </div>
  );
}
