import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CarWithImages } from "./types";
import { getCarImageUrl } from "./api";
import { formatCarPrice, formatCarKilometers } from "@/lib/formatters";
import { CalendarDays, Fuel, Gauge } from "lucide-react";

const missingValue = "-";

export function CarCard({
  car,
  buttonText,
}: {
  car: CarWithImages;
  buttonText: string;
}) {
  const coverImage =
    car.car_images.find((image) => image.is_cover) ?? car.car_images[0];

  const coverUrl = coverImage ? getCarImageUrl(coverImage.storage_path) : null;

  return (
    <Card className="relative w-full pt-0">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={coverImage?.alt || `${car.brand} ${car.model}`}
          className="relative z-20 aspect-video w-full object-cover"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
          Immagine non disponibile
        </div>
      )}
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Marca e modello
        </p>
        <CardTitle>
          {car.brand} {car.model}
        </CardTitle>

        {car.version?.trim() && (
          <CardDescription className="mt-2">
            <span className="block text-xs font-semibold uppercase tracking-wide">Versione</span>
            <span className="mt-0.5 block font-medium text-foreground">{car.version}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-3 gap-3">
          <div className="min-w-0">
            <dt className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarDays size={16} aria-hidden="true" /> Anno
            </dt>
            <dd className="text-sm font-medium">{car.year ?? missingValue}</dd>
          </div>
          <div className="min-w-0">
            <dt className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Gauge size={16} aria-hidden="true" /> Chilometri
            </dt>
            <dd className="text-sm font-medium">
              {car.kilometers == null ? missingValue : formatCarKilometers(car.kilometers)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Fuel size={16} aria-hidden="true" /> Alimentazione
            </dt>
            <dd className="text-sm font-medium">{car.fuel?.trim() || missingValue}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prezzo</p>
          <p className="mt-0.5 text-xl font-semibold text-primary-dark">
            {car.price == null ? missingValue : formatCarPrice(car.price)}
          </p>
        </div>
        <ButtonLink className="w-full uppercase" to={`/auto-usate/${car.slug}`}>
          {buttonText}
        </ButtonLink>
      </CardFooter>
    </Card>
  );
}
