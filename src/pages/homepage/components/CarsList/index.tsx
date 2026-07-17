import { CardImage } from "@/shared/components/CardImage";
import type { Car } from "../../types";

export const CarsList = ({
  cars,
  isLoading,
  isError,
}: {
  cars?: Car[];
  isLoading: boolean;
  isError: boolean;
}) => {
  if (isLoading) return <p>Caricamento...</p>;
  if (isError) return <p>Errore nel caricamento delle auto.</p>;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Auto Usate</h2>
      <div>
        {cars?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
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
