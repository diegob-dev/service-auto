import { Section } from "@/app/layouts/Section";
import { ButtonAnchor } from "@/components/ui/button-link";
import { PHONE_NUMBER } from "@/lib/constants";
import { PageHero } from "@/components/PageHero";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ServiceImage from "@/assets/service-image.webp";
import { COMPANY } from "@/lib/company";
import {
  Clock3,
  MapPin,
  Navigation,
  Phone,
  Mail,
  type LucideIcon,
} from "lucide-react";

const DIRECTIONS_URL = COMPANY.directionsUrl;

export function ContactPage() {
  const [mapVisible, setMapVisible] = useState(false);
  const phoneHref = `tel:${PHONE_NUMBER.replace(/\s/g, "")}`;

  return (
    <>
      <PageHero
        image={{ src: ServiceImage, position: "center 45%" }}
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
              icon={Mail}
              title="Email"
              description="Scrivici per informazioni."
              value={COMPANY.email}
              href={`mailto:${COMPANY.email}`}
            />
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
              description={COMPANY.workshopAddress}
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
                {COMPANY.street}
                <br />
                {COMPANY.postalCode} {COMPANY.city} ({COMPANY.province})
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
            {/* La mappa si carica solo su richiesta, come indicato nelle informative privacy e cookie. */}
            {mapVisible ? (
              <div className="relative">
                <iframe
                  title={`Mappa di ${COMPANY.name} — ${COMPANY.street}, ${COMPANY.city}`}
                  src={COMPANY.mapEmbedUrl}
                  className="block h-80 w-full border-0 sm:h-120"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-3 left-3 bg-background/95 shadow-md"
                  onClick={() => setMapVisible(false)}
                >
                  Nascondi la mappa
                </Button>
              </div>
            ) : (
              <div className="relative h-80 overflow-hidden sm:h-120">
                <MapPreviewArt />
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-foreground/35 via-foreground/10 to-transparent p-4">
                  <div className="w-full max-w-sm rounded-2xl bg-background/90 p-6 text-center shadow-xl ring-1 ring-border backdrop-blur-sm">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary-dark">
                      <MapPin className="size-6" aria-hidden="true" />
                    </span>
                    <p className="mt-3 font-display text-2xl tracking-wide uppercase">
                      Mappa interattiva
                    </p>
                    <Button type="button" className="mt-4 w-full" onClick={() => setMapVisible(true)}>
                      Mostra la mappa Google
                    </Button>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      Caricando la mappa, Google riceve il tuo indirizzo IP e può usare cookie propri.{" "}
                      <Link to="/cookie" className="underline hover:text-foreground">Informativa cookie</Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

/** Sfondo decorativo che richiama una mappa: non carica nulla da servizi esterni. */
function MapPreviewArt() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 size-full scale-110 blur-[3px]"
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="800" height="500" fill="#e9edf1" />
      <g fill="#dde3ea">
        <rect x="40" y="40" width="150" height="110" rx="8" />
        <rect x="230" y="30" width="120" height="140" rx="8" />
        <rect x="560" y="40" width="190" height="100" rx="8" />
        <rect x="60" y="210" width="130" height="150" rx="8" />
        <rect x="470" y="300" width="140" height="150" rx="8" />
        <rect x="650" y="210" width="110" height="170" rx="8" />
        <rect x="250" y="370" width="170" height="100" rx="8" />
      </g>
      <rect x="390" y="40" width="130" height="120" rx="12" fill="#d4e4d1" />
      <rect x="250" y="220" width="160" height="110" rx="12" fill="#d4e4d1" />
      <g fill="none" stroke="#ffffff" strokeLinecap="round">
        <path d="M0 190 H800" strokeWidth="14" />
        <path d="M210 0 V500" strokeWidth="12" />
        <path d="M540 0 V500" strokeWidth="10" />
        <path d="M0 400 C200 380 300 450 800 430" strokeWidth="8" />
        <path d="M630 190 L760 500" strokeWidth="8" />
        <path d="M0 80 H210" strokeWidth="6" />
      </g>
      <path d="M-20 520 L380 250 L820 -20" fill="none" stroke="#f1dfa8" strokeWidth="22" strokeLinecap="round" />
      <circle cx="400" cy="244" r="30" fill="currentColor" className="text-primary/25" />
    </svg>
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
        <h3 className="font-display text-xl tracking-wide uppercase">
          {title}
        </h3>
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
