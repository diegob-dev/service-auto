import type { ReactNode } from "react";

import { Container } from "@/app/layouts/Container";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  image?: { src: string; position?: string };
};

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  image,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-foreground text-background">
      {image ? (
        <>
          <img
            src={image.src}
            alt=""
            style={{ objectPosition: image.position ?? "center" }}
            className="absolute inset-0 -z-20 size-full object-cover opacity-75"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-foreground via-foreground/85 to-foreground/25" />
        </>
      ) : (
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-br from-foreground via-foreground to-primary/20" />
      )}
      <Container className="py-5 sm:py-10 lg:py-15">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-4 font-display text-4xl leading-[1.2] tracking-wide uppercase sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-background/75 sm:text-xl">
            {description}
          </p>
          {children && (
            <div className="mt-8 flex flex-wrap gap-4">{children}</div>
          )}
        </div>
      </Container>
    </section>
  );
}
