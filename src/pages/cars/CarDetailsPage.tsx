import { Section } from "@/app/layouts/Section";
import { ButtonLink } from "@/components/ui/button-link";
import { currencyFormatter, numberFormatter } from "@/utils/utils";
import { useParams } from "react-router-dom";
import { useGetCarsList } from "../homepage/hooks/useGetCarsList";

export function CarDetailsPage() {
  const { carId } = useParams();
  const { data: cars, isLoading, isError } = useGetCarsList();
  const car = cars?.find(({ id }) => String(id) === carId);

  if (isLoading) return <Section height="md">Caricamento...</Section>;
  if (isError) return <Section height="md">Errore nel caricamento.</Section>;
  if (!car) {
    return (
      <Section height="md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Auto non trovata</h1>
          <ButtonLink className="mt-6" to="/auto-usate">
            Vedi tutte le auto
          </ButtonLink>
        </div>
      </Section>
    );
  }

  return (
    <Section height="md">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <img
          src={car.src}
          alt={car.model}
          className="aspect-video w-full rounded-xl object-cover"
        />
        <div>
          <h1 className="font-display text-5xl uppercase">{car.model}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{car.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4">
            <div><dt className="text-muted-foreground">Anno</dt><dd>{car.year}</dd></div>
            <div><dt className="text-muted-foreground">Chilometri</dt><dd>{numberFormatter.format(car.kilometers)} km</dd></div>
            <div><dt className="text-muted-foreground">Alimentazione</dt><dd>{car.fuel}</dd></div>
            <div><dt className="text-muted-foreground">Prezzo</dt><dd>{currencyFormatter.format(car.price)}</dd></div>
          </dl>
          <ButtonLink className="mt-8" to="/contatti">
            Richiedi informazioni
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
