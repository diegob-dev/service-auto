import { CardCarWithImage } from "@/shared/components/CardCarWithImage";
import type { ReactNode } from "react";
import type { Car } from "../../types";

type CarsListProps = {
  cars?: Car[];
  isLoading: boolean;
  isError: boolean;
  title?: ReactNode;
};

export const CarsList = ({ cars, isLoading, isError }: CarsListProps) => {
  if (isLoading) return <p>Caricamento...</p>;
  if (isError) return <p>Errore nel caricamento delle auto.</p>;
  return (
    <div>
      {cars?.length ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CardCarWithImage
              key={car.id}
              car={car}
              buttonText="Scopri di più"
            />
          ))}
        </div>
      ) : (
        <p>Nessuna auto disponibile.</p>
      )}
    </div>
  );
};
