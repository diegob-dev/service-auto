import { Section } from "@/app/layouts/Section";
import { ButtonAnchor } from "@/components/ui/button-link";
import { PHONE_NUMBER } from "@/lib/constants";
import { PageHero } from "@/components/PageHero";
import {
  Clock3,
  MapPin,
  Navigation,
  Phone,
  type LucideIcon,
} from "lucide-react";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Service+SRL+Corso+Giacomo+Brodolini+32+Vigevano";

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

      <Section height="md" className="pb-6 sm:pb-8">
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
              icon={MapPin}
              title="Dove siamo"
              description="Corso Giacomo Brodolini, 32 · 27029 Vigevano (PV)"
              value="Apri le indicazioni"
              href={DIRECTIONS_URL}
              external
            />
            <ContactDetail
              icon={Clock3}
              title="Orari"
              description="Lunedì–Venerdì: 08:00–12:00 · 14:00–19:00"
              value="Sabato e domenica chiuso"
            />
          </div>
        </div>
      </Section>

      <Section
        height="md"
        className="bg-muted/40 pt-6 sm:pt-8"
        aria-labelledby="location-heading"
      >
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-primary-dark uppercase">
              Raggiungici
            </p>
            <h2
              id="location-heading"
              className="mt-3 font-display text-4xl leading-tight tracking-wide uppercase sm:text-5xl"
            >
              Ti aspettiamo a Vigevano
            </h2>
            <address className="mt-6 flex items-start gap-3 text-lg not-italic text-muted-foreground">
              <MapPin
                className="mt-1 size-5 shrink-0 text-primary-dark"
                aria-hidden="true"
              />
              <span>
                Corso Giacomo Brodolini, 32
                <br />
                27029 Vigevano (PV)
              </span>
            </address>
            <ButtonAnchor
              className="mt-8"
              size="lg"
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="size-4" aria-hidden="true" />
              Indicazioni stradali
            </ButtonAnchor>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <iframe
              title="Mappa di Service SRL — Corso Giacomo Brodolini 32, Vigevano"
              src="https://www.google.com/maps?q=Service+SRL+Corso+Giacomo+Brodolini+32+Vigevano&output=embed"
              className="block h-80 w-full border-0 sm:h-120"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
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
  href?: string;
  external?: boolean;
};

function ContactDetail({
  icon: Icon,
  title,
  description,
  value,
  href,
  external = false,
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
        {href ? (
          <a
            href={href}
            className="mt-2 inline-block font-semibold text-primary-dark hover:underline"
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {value}
          </a>
        ) : (
          <p className="mt-2 font-semibold text-foreground">{value}</p>
        )}
      </div>
    </article>
  );
}
