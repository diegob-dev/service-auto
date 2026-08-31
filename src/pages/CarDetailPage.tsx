import { Section } from "@/app/layouts/Section";
import { ButtonLink } from "@/components/ui/button-link";
import { currencyFormatter, numberFormatter } from "@/lib/formatters";
import { useParams } from "react-router-dom";
import { usePublishedCars } from "@/features/cars/hooks";
import { getCarImageUrl } from "@/features/cars/api";

export function CarDetailPage() {
  const { carSlug } = useParams();
  const { data: cars, isLoading, isError } = usePublishedCars();

  const car = cars?.find(({ slug }) => slug === carSlug);

  const coverImage =
    car?.car_images.find((image) => image.is_cover) ?? car?.car_images[0];

  const coverUrl = coverImage ? getCarImageUrl(coverImage.storage_path) : null;

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
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={coverImage?.alt || `${car.brand} ${car.model}`}
            className="aspect-video w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-muted-foreground">
            Immagine non disponibile
          </div>
        )}
        <div>
          <h1 className="font-display text-5xl uppercase">
            {car.brand} {car.model}
          </h1>

          {car.version && <p className="mt-2 text-xl">{car.version}</p>}

          {car.description && (
            <p className="mt-3 text-lg text-muted-foreground">
              {car.description}
            </p>
          )}
          <dl className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-muted-foreground">Anno</dt>
              <dd>{car.year}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Chilometri</dt>
              <dd>{numberFormatter.format(car.kilometers)} km</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Alimentazione</dt>
              <dd>{car.fuel ?? "Non specificato"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Prezzo</dt>
              <dd>{currencyFormatter.format(car.price)}</dd>
            </div>
          </dl>
          <ButtonLink className="mt-8" to="/contatti">
            Richiedi informazioni
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
