import { Container } from "@/app/layouts/Container";
import { Section } from "@/app/layouts/Section";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button-link";
import { PHONE_NUMBER } from "@/constants";

type InfoPageProps = {
  title: string;
  description: string;
};

export function InfoPage({ title, description }: InfoPageProps) {
  return (
    <Section height="lg">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-5xl uppercase text-primary-dark">
          {title}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">{description}</p>
        <ButtonLink className="mt-8" to="/contatti">
          Contattaci
        </ButtonLink>
      </div>
    </Section>
  );
}

export function ContactPage() {
  const phoneHref = `tel:${PHONE_NUMBER.replace(/\s/g, "")}`;

  return (
    <Section height="lg">
      <Container className="text-center">
        <h1 className="font-display text-5xl uppercase text-primary-dark">
          Contatti
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Chiamaci per informazioni o per prenotare un appuntamento.
        </p>
        <ButtonAnchor className="mt-8" href={phoneHref}>
          Chiama {PHONE_NUMBER}
        </ButtonAnchor>
      </Container>
    </Section>
  );
}

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
