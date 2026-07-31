import { ImageMaxWidth } from "./components/ImageMaxWidth";
import ServiceImage from "../../assets/service-image.jpg";
import { Container } from "../../app/layouts/Container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Award,
  Car,
  CircuitBoard,
  ShieldCheck,
  Snowflake,
  SquareActivity,
  Star,
  Wrench,
} from "lucide-react";
import { CarsList } from "./components/CarsList";
import { useHomepage } from "./hooks/useHomepage";
import { Section } from "@/app/layouts/Section";
import { OptionsList } from "@/shared/components/OptionsList";

export const Homepage = () => {
  const { cars, isLoading, isError } = useHomepage();

  return (
    <>
      <ImageMaxWidth src={ServiceImage} alt="Service Image">
        <Container
          size="large"
          className="flex h-full items-center justify-start "
        >
          <div>
            <h1 className="font-display tracking-medium text-5xl uppercase leading-tight text-white-soft md:text-6xl">
              Officina specializzata <br />
              <span className="text-primary-dark">Volvo</span>
              <br />e auto usate garantite
            </h1>
            <p className="mt-4 text-lg text-white-soft/80">
              Passione. Competenza. Affidabilità.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="default" size="lg">
                <Link
                  to="/contatti"
                  className="flex items-center h-full w-full"
                >
                  <Wrench className="mr-2 size-4" />
                  Prenota appuntamento
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link to="/auto-usate" className="flex items-center">
                  <Car className="mr-2 size-4" />
                  Scopri auto usate
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </ImageMaxWidth>
      <Section tone="light" height="md">
        <CarsList cars={cars} isLoading={isLoading} isError={isError} />
      </Section>
      <Section tone="dark" height="md">
        <OptionsList
          title={
            <>
              I nostri <span className="text-primary">servizi</span> officina
            </>
          }
          primaryButton="Scopri tutti i servizi"
          variant="dark"
          icons={[
            {
              title: "Diagnosi computerizzata",
              description:
                "Tecnologia ufficiale Volvo per una diagnosi precisa e affidabile.",
              icon: <SquareActivity size={50} />,
            },
            {
              title: "Tagliandi",
              description:
                "Tagliandi secondo gli standard Volvo con ricambi originali e certificati.",
              icon: <Wrench size={50} />,
            },
            {
              title: "Elettronica",
              description:
                "Riparazioni e interventi su centraline, sensori e sistemi elettronici.",
              icon: <CircuitBoard size={50} />,
            },
            {
              title: "Pneumatici",
              description:
                "Vendita e assistenza pneumatici delle migliori marche.",
              icon: <Car size={50} />,
            },
            {
              title: "Climatizzatore",
              description:
                "Ricarica, sanificazione e manutenzione impianti climatizzazione.",
              icon: <Snowflake size={50} />,
            },
          ]}
        />
      </Section>
      <Section tone="light" height="md">
        <OptionsList
          variant="light"
          icons={[
            {
              title: "Specializzati Volvo",
              description: "Conosciamo ogni dettaglio della tua Volvo.",
              icon: <ShieldCheck size={50} />,
            },
            {
              title: "Esperienza",
              description: "Anni di esperienza nel settore automobilistico.",
              icon: <Award size={50} />,
            },
            {
              title: "Recensioni",
              description: "4.4/5 su Google con oltre 100 recensioni positive.",
              icon: <Star size={50} />,
            },
            {
              title: "Garanzia",
              description: "Garanzia su tutti i nostri veicoli usati.",
              icon: <ShieldCheck size={50} />,
            },
          ]}
        />
      </Section>
    </>
  );
};
