import WorkshopImage from "@/assets/workshop-specialists.jpg";
import { Section } from "@/app/layouts/Section";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button-link";
import { Award, CheckCircle2, Clock3, MapPin, Navigation, ShieldCheck, Users } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { FeatureGrid } from "@/components/FeatureGrid";

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Service SRL"
        title={
          <>
            Competenza che diventa <span className="text-primary">fiducia</span>
          </>
        }
        description="Siamo un'officina specializzata Volvo e selezioniamo auto usate con attenzione. Per noi ogni lavoro comincia da un rapporto semplice, diretto e trasparente."
      >
        <ButtonLink size="lg" to="/contatti">
          Parla con noi
        </ButtonLink>
      </PageHero>

      <Section height="lg">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={WorkshopImage}
              alt="Tecnico al lavoro all'interno dell'officina Service SRL"
              className="aspect-4/3 size-full object-cover object-[68%_center]"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-primary-dark uppercase">
              Come lavoriamo
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-wide uppercase sm:text-5xl">
              Persone, prima ancora che automobili
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Crediamo nella competenza concreta e nelle spiegazioni semplici.
              Per questo ascoltiamo le esigenze del cliente, controlliamo con
              cura ogni vettura e proponiamo soluzioni comprensibili.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Attenzione per ogni dettaglio",
                "Scelte condivise con il cliente",
                "Passione per Volvo e per il nostro lavoro",
              ].map((value) => (
                <li key={value} className="flex items-center gap-3 font-medium">
                  <CheckCircle2
                    className="size-5 shrink-0 text-primary-dark"
                    aria-hidden="true"
                  />
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="dark" height="md">
        <FeatureGrid
          features={[
            {
              title: "Esperienza",
              description:
                "Conoscenza costruita ogni giorno lavorando sulle auto.",
              icon: Award,
            },
            {
              title: "Affidabilità",
              description:
                "Indicazioni chiare e attenzione in ogni intervento.",
              icon: ShieldCheck,
            },
            {
              title: "Rapporto diretto",
              description:
                "Un confronto semplice con chi si occupa della tua auto.",
              icon: Users,
            },
          ]}
        />
      </Section>

      <Section height="lg" aria-labelledby="location-heading">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-primary-dark uppercase">
              Dove siamo
            </p>
            <h2 id="location-heading" className="mt-3 font-display text-4xl leading-tight tracking-wide uppercase sm:text-5xl">
              Ti aspettiamo a Vigevano
            </h2>
            <address className="mt-6 flex items-start gap-3 text-lg not-italic">
              <MapPin className="mt-1 size-5 shrink-0 text-primary-dark" aria-hidden="true" />
              <span>Corso Giacomo Brodolini, 32<br />27029 Vigevano (PV)</span>
            </address>

            <div className="mt-8 rounded-2xl border border-border p-6">
              <h3 className="flex items-center gap-3 text-lg font-semibold">
                <Clock3 className="size-5 text-primary-dark" aria-hidden="true" />
                Orari di apertura
              </h3>
              {/* Orari verificati sulla scheda Google Maps di SERVICE SRL il 6 settembre 2026. */}
              <dl className="mt-4 divide-y divide-border text-sm sm:text-base">
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3">
                  <dt className="font-medium">Lunedì – Venerdì</dt>
                  <dd className="text-muted-foreground">08:00–12:00 · 14:00–19:00</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="font-medium">Sabato</dt>
                  <dd className="text-muted-foreground">Chiuso</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="font-medium">Domenica</dt>
                  <dd className="text-muted-foreground">Chiuso</dd>
                </div>
              </dl>
            </div>

            <ButtonAnchor
              className="mt-6"
              size="lg"
              href="https://www.google.com/maps/dir/?api=1&destination=Service+SRL+Corso+Giacomo+Brodolini+32+Vigevano"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="size-4" aria-hidden="true" />
              Indicazioni stradali
            </ButtonAnchor>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <iframe
              title="Mappa di Service SRL — Corso Giacomo Brodolini 32, Vigevano"
              src="https://www.google.com/maps?q=Service+SRL+Corso+Giacomo+Brodolini+32+Vigevano&output=embed"
              className="block h-80 w-full border-0 sm:h-[480px] lg:h-[540px]"
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
