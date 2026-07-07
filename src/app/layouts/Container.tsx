type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`max-w-360 mx-auto px-4 ${className}`}>{children}</div> // max width 1440px
  );
}

export function ContainerLarge({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-500 px-4 sm:px-6 lg:px-8 ${className}`} // max width 1840px
    >
      {children}
    </div>
  );
}
