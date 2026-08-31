import { Section } from "@/app/layouts/Section";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Car,
  CheckCircle2,
  CircuitBoard,
  Snowflake,
  Wrench,
  CarBattery,
  ShieldCheck,
  CircleDot,
  Medal,
  WrenchIcon,
  Users,
  CalendarDays,
  Search,
  CalendarPlus,
} from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { FeatureGrid, type Feature } from "@/components/FeatureGrid";
import { CallToAction } from "@/components/CallToAction";
import { SectionHeader } from "@/components/SectionHeader";
import { IconWithImage } from "@/components/IconWithImage";
import AutoImage from "@/assets/auto.png";
import BatterieImage from "@/assets/batterie.png";
import ClimatizzatoreImage from "@/assets/climatizzatore.png";
import DiagnosiImage from "@/assets/diagnosi.png";
import ElettronicaImage from "@/assets/elettronica.png";
import FreniImage from "@/assets/freno.png";
import PneumaticiImage from "@/assets/pneumatici.png";
import PreRevisioneImage from "@/assets/pre-revisione.png";
import TagliandoImage from "@/assets/tagliando.png";
import { Steps, type Step } from "@/components/Steps";

const services: Feature[] = [
  {
    title: "Diagnosi",
    description:
      "Diagnosi elettroniche avanzate con strumentazione originale e multimarca per individuare e risolvere ogni problema.",
    icon: ShieldCheck,
    image: DiagnosiImage,
  },
  {
    title: "Tagliandi",
    description:
      "Tagliandi secondo gli standard dei costruttori, per mantenere efficienza e affidabilità nel tempo e preservare la garanzia.",
    icon: Wrench,
    image: TagliandoImage,
  },
  {
    title: "Elettronica",
    description:
      "Riparazione e codifica di centraline, sensori e sistemi elettronici con competenza specialistica e attrezzature dedicate.",
    icon: CircuitBoard,
    image: ElettronicaImage,
  },
  {
    title: "Freni",
    description:
      "Controllo, sostituzione e spurgo impianto frenante per la massima sicurezza in ogni condizione di guida.",
    icon: Car,
    image: FreniImage,
  },
  {
    title: "Pneumatici",
    description:
      "Vendita e montaggio pneumatici delle migliori marche, equilibratura e convergenza computerizzata.",
    icon: CircleDot,
    image: PneumaticiImage,
  },
  {
    title: "Climatizzazione",
    description:
      "Ricarica, sanificazione e controllo del clima per un ambiente sempre confortevole e salubre.",
    icon: Snowflake,
    image: ClimatizzatoreImage,
  },
  {
    title: "Batterie",
    description:
      "Test batterie e sostituzione con prodotti di alta qualità per partenza sempre affidabili.",
    icon: CarBattery,
    image: BatterieImage,
  },
  {
    title: "Pre-revisione",
    description:
      "Controllo completo del veicolo e verifica dei principali sistemi per affrontare la revisione senza pensieri",
    icon: CheckCircle2,
    image: PreRevisioneImage,
  },
];

const competences: Feature[] = [
  {
    icon: Medal,
    title: "Esperienza certificata",
    description:
      "Tecnici qualificati e formazione continua su tutte le marche.",
  },
  {
    icon: WrenchIcon,
    title: "Attrezzature avanzate",
    description:
      "Strumenti di diagnosi e riparazione multimarca di ultima generazione.",
  },
  {
    icon: ShieldCheck,
    title: "Ricambi di qualità",
    description: "Ricambi selezionati e garantiti per ogni tipo di veicolo.",
  },
  {
    icon: Users,
    title: "Assistenza trasparente",
    description:
      "Chiarezza, onestà e aggiornamenti costanti su ogni intervento.",
  },
];

const steps: Step[] = [
  {
    icon: CalendarDays,
    title: "Prenotazione",
    description: "Ci contatti e prenoti il tuo appuntamento quando preferisci.",
  },
  {
    icon: Search,
    title: "Diagnosi",
    description: "Analizziamo la tua auto con strumenti avanzati e competenza.",
  },
  {
    icon: Wrench,
    title: "Intervento",
    description:
      "Eseguiamo il lavoro con cura, utilizzando ricambi di qualità.",
  },
  {
    icon: Car,
    title: "Consegna e follow-up",
    description:
      "Ti riconsegniamo l'auto e restiamo a disposizione per ogni necessità.",
  },
];

export function ServicesPage() {
  return (
    <>
      <PageHero
        title={<>Assistenza completa per ogni auto</>}
        description={
          <>
            Esperienza multimarca, <br /> competenza specializzata Volvo.
          </>
        }
      >
        <ButtonLink size="lg" to="/contatti">
          Richiedi un appuntamento
        </ButtonLink>
      </PageHero>

      <Section height="lg">
        <SectionHeader
          title="I nostri servizi"
          subtitle="Soluzioni complete e tecnologie avanzate per prenderti cura della tua auto."
          align="center"
          showLines
        />
        <FeatureGrid features={services} />
      </Section>

      <Section tone="dark">
        <IconWithImage
          title="Competenza multimarca"
          description="La nostra officina è indipendente e attrezzata per intervenire su tutte le principali marche auto. Esperienza multimarca, con specializzazione Volvo."
          image={{
            src: AutoImage,
            alt: "Auto in officina",
          }}
          options={competences}
          tone="dark"
        />
      </Section>
      <Section>
        <SectionHeader
          title="Come lavoriamo"
          eyebrow="Dalla prenotazione alla consegna"
          align="center"
          showLines
        />
        <Steps steps={steps} />
      </Section>
      <CallToAction
        title="Prenota ora il tuo intervento"
        subtitle="Affidati ai nostri specialisti"
        icon={CalendarPlus}
      />
    </>
  );
}
