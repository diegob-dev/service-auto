import { Section } from "@/app/layouts/Section";
import { ButtonLink } from "@/components/ui/button-link";
import { CallToAction } from "@/shared/components/CallToAction";
import { FeatureGrid, type Feature } from "@/shared/components/FeatureGrid";
import { PageHero } from "@/shared/components/PageHero";
import { Gauge, MessageCircle, ShieldCheck } from "lucide-react";

const workshopFeatures: Feature[] = [
  {
    title: "Competenza Volvo",
    description:
      "Conosciamo tecnologie, sistemi e necessità specifiche delle vetture Volvo.",
    icon: ShieldCheck,
  },
  {
    title: "Diagnosi precisa",
    description:
      "Strumenti computerizzati per individuare il problema e intervenire con chiarezza.",
    icon: Gauge,
  },
  {
    title: "Lavoro trasparente",
    description:
      "Ti spieghiamo gli interventi necessari prima di procedere sulla tua auto.",
    icon: MessageCircle,
  },
];

export function WorkshopPage() {
  return (
    <>
      <PageHero
        eyebrow="La nostra officina"
        title={
          <>
            La tua Volvo in <span className="text-primary">buone mani</span>
          </>
        }
        description="Esperienza, diagnosi accurata e un rapporto diretto: ci prendiamo cura della tua auto con la stessa attenzione che le dedicheresti tu."
      >
        <ButtonLink size="lg" to="/contatti">
          Prenota un appuntamento
        </ButtonLink>
        <ButtonLink size="lg" variant="outline" to="/servizi">
          Scopri i servizi
        </ButtonLink>
      </PageHero>

      <Section height="lg">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-primary-dark uppercase">
              Il nostro metodo
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-wide uppercase sm:text-5xl">
              Prima capiamo. Poi interveniamo.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Partiamo dall'ascolto e da una diagnosi precisa. Valutiamo ciò che
            serve davvero e ti accompagniamo in ogni decisione, con spiegazioni
            semplici e interventi proporzionati alle condizioni dell'auto.
          </p>
        </div>
        <div className="mt-12">
          <FeatureGrid features={workshopFeatures} />
        </div>
      </Section>

      <CallToAction />
    </>
  );
}
