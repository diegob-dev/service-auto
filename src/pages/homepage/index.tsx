import { ImageCard } from "./components/ImageCard";
import ServiceImage from "../../assets/service-image.jpg";
import { Container, ContainerLarge } from "../../app/layouts/Container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Car, Wrench } from "lucide-react";
import { CarsList } from "./components/CarsList";

export const Homepage = () => {
  return (
    <>
      <ImageCard src={ServiceImage} alt="Service Image">
        <ContainerLarge className="flex h-full items-center">
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
        </ContainerLarge>
      </ImageCard>
      <Container>
        <CarsList />
      </Container>
    </>
  );
};
