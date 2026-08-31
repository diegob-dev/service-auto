import WorkshopImage from "@/assets/workshop-specialists.jpg";
import { Section } from "@/app/layouts/Section";
import { ButtonLink } from "@/components/ui/button-link";
import { Award, CheckCircle2, ShieldCheck, Users } from "lucide-react";
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
    </>
  );
}
