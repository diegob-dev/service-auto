import { CardImage } from "@/shared/components/CardImage";
import { SectionTitle } from "@/shared/components/SectionTitle";
import type { ReactNode } from "react";
import type { Car } from "../../types";

type CarsListProps = {
  cars?: Car[];
  isLoading: boolean;
  isError: boolean;
  title?: ReactNode;
};

export const CarsList = ({
  cars,
  isLoading,
  isError,
  title = (
    <>
      Auto usate <span className="text-primary-dark">in evidenza</span>
    </>
  ),
}: CarsListProps) => {
  if (isLoading) return <p>Caricamento...</p>;
  if (isError) return <p>Errore nel caricamento delle auto.</p>;
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div>
        {cars?.length ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CardImage key={car.id} car={car} buttonText="Scopri di più" />
            ))}
          </div>
        ) : (
          <p>Nessuna auto disponibile.</p>
        )}
      </div>
    </div>
  );
};
