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
      className={`flex flex-row items-stretch divide-x divide-muted-foreground/30 w-full ${containerClassName}`}
    >
      {icons &&
        icons.map((icon, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col items-center text-center gap-2 px-6"
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
