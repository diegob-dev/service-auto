import { Section } from "@/app/layouts/Section";
import { ButtonLink } from "@/components/ui/button-link";

export function CallToAction() {
  return (
    <Section tone="dark" height="md">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
            Hai bisogno di assistenza?
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-wide uppercase sm:text-5xl">
            Parliamo della tua auto
          </h2>
        </div>
        <ButtonLink className="shrink-0" size="lg" to="/contatti">
          Contattaci
        </ButtonLink>
      </div>
    </Section>
  );
}
