import { Section } from "@/app/layouts/Section";
import { ButtonLink } from "@/components/ui/button-link";

export function NotFoundPage() {
  return (
    <Section height="lg">
      <div className="text-center">
        <p className="font-display text-7xl text-primary-dark">404</p>
        <h1 className="mt-2 text-3xl font-bold">Pagina non trovata</h1>
        <ButtonLink className="mt-8" to="/">
          Torna alla home
        </ButtonLink>
      </div>
    </Section>
  );
}
