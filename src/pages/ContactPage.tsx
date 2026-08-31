import { Section } from "@/app/layouts/Section";
import { ButtonAnchor } from "@/components/ui/button-link";
import { PHONE_NUMBER } from "@/lib/constants";
import { PageHero } from "@/components/PageHero";
import { Clock3, Phone, Sparkles, type LucideIcon } from "lucide-react";

export function ContactPage() {
  const phoneHref = `tel:${PHONE_NUMBER.replace(/\s/g, "")}`;

  return (
    <>
      <PageHero
        eyebrow="Siamo qui per aiutarti"
        title={<span className="text-primary">Contatti</span>}
        description="Chiamaci per informazioni, per raccontarci il problema o per concordare un appuntamento in officina."
      >
        <ButtonAnchor size="lg" href={phoneHref}>
          <Phone className="mr-2 size-4" />
          Chiama {PHONE_NUMBER}
        </ButtonAnchor>
      </PageHero>

      <Section height="lg">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
            <p className="text-sm font-semibold tracking-[0.2em] text-primary-dark uppercase">
              Contatto diretto
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-wide uppercase">
              Raccontaci cosa ti serve
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Per offrirti indicazioni utili, tieni a portata di mano il modello
              dell'auto e una breve descrizione dell'intervento o del problema.
            </p>
            <ButtonAnchor className="mt-8" size="lg" href={phoneHref}>
              <Phone className="mr-2 size-4" />
              {PHONE_NUMBER}
            </ButtonAnchor>
          </div>

          <div className="grid gap-4">
            <ContactDetail
              icon={Phone}
              title="Telefono"
              description="Chiamaci per informazioni e appuntamenti."
              value={PHONE_NUMBER}
              href={phoneHref}
            />
            <ContactDetail
              icon={Clock3}
              title="Appuntamenti"
              description="Contattaci per verificare disponibilità e orari."
              value="Prenota telefonicamente"
              href={phoneHref}
            />
            <ContactDetail
              icon={Sparkles}
              title="Prima della visita"
              description="Descrivici il problema: potremo accoglierti al meglio."
              value="Parla con l'officina"
              href={phoneHref}
            />
          </div>
        </div>
      </Section>
    </>
  );
}

type ContactDetailProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  href: string;
};

function ContactDetail({
  icon: Icon,
  title,
  description,
  value,
  href,
}: ContactDetailProps) {
  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-display text-xl tracking-wide uppercase">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <a
          href={href}
          className="mt-2 inline-block font-semibold text-primary-dark hover:underline"
        >
          {value}
        </a>
      </div>
    </article>
  );
}
