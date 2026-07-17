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
    <div className="relative w-full h-170 overflow-hidden">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-r from-foreground/90 from-30% via-foreground/60 via-50% to-transparent flex items-center justify-center text-background">
        {children}
      </div>
    </div>
  );
};
