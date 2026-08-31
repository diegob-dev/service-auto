export const ImageMaxWidth = ({
  src,
  alt,
  children,
}: {
  src: string;
  alt?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="relative h-130 w-full overflow-hidden md:h-150">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-foreground/70 md:bg-transparent text-background md:bg-linear-to-r md:from-foreground/90 md:from-30% md:via-foreground/60 md:via-50% md:to-transparent">
        {children}
      </div>
    </div>
  );
};
