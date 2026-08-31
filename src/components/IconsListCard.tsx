export interface IconsListCardProps {
  icons: { title: string; description: string; icon: React.ReactNode }[];
  variant?: "dark" | "light";
}

export const IconsListCard = ({
  icons,
  variant = "dark",
}: IconsListCardProps) => {
  const containerClassName =
    variant === "dark" ? "text-secondary-foreground" : " text-foreground";
  return (
    <div
      className={`grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))] ${containerClassName}`}
    >
      {icons &&
        icons.map((icon, index) => (
          <div
            key={`${icon.title}-${index}`}
            className="flex flex-col items-center gap-2 border-muted-foreground/30 px-4 text-center sm:border-l sm:first:border-l-0 lg:px-6"
          >
            <div className="mb-3 text-primary">{icon.icon}</div>
            <div className="flex flex-col items-center justify-between gap-2 w-full">
              <h3 className="text-xl font-semibold uppercase">{icon.title}</h3>
              <p className="text-md">{icon.description}</p>
            </div>
          </div>
        ))}
    </div>
  );
};
