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
        <CardTitle>
          {car.brand} {car.model}
        </CardTitle>

        {car.version?.trim() && <CardDescription>{car.version}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-end gap-1">
            <CalendarDays size={20} />
            <p className="text-sm">{car.year ?? "—"}</p>
          </div>
          <div className="flex flex-row items-end gap-1">
            <Gauge size={20} />
            <p className="text-sm">
              {formatCarKilometers(car.kilometers)}
            </p>
          </div>
          <div className="flex flex-row items-end gap-1">
            <Fuel size={20} />
            <p className="text-sm">{car.fuel?.trim() || "—"}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-3">
        <p className="text-xl font-semibold text-primary-dark">
          {formatCarPrice(car.price)}
        </p>
        <ButtonLink className="w-full uppercase" to={`/auto-usate/${car.slug}`}>
          {buttonText}
        </ButtonLink>
      </CardFooter>
    </Card>
  );
}
