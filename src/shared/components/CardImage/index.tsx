import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Car } from "@/pages/homepage/types";
import { numberFormatter } from "@/utils/utils";
import { CalendarDays, Fuel, Gauge } from "lucide-react";

export function CardImage({
  car,
  buttonText,
}: {
  car: Car;
  buttonText: string;
}) {
  return (
    <Card className="relative w-full pt-0">
      <img
        src={car.src}
        alt={car.model}
        className="relative z-20 aspect-video w-full object-cover "
      />
      <CardHeader>
        <CardTitle>{car.model}</CardTitle>
        <CardDescription>{car.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-end gap-1">
            <CalendarDays size={20} />
            <p className="text-sm">{car.year}</p>
          </div>
          <div className="flex flex-row items-end gap-1">
            <Gauge size={20} />
            <p className="text-sm">
              {numberFormatter.format(car.kilometers)} km
            </p>
          </div>
          <div className="flex flex-row items-end gap-1">
            <Fuel size={20} />
            <p className="text-sm">{car.fuel}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-3">
        <p className="text-xl font-semibold text-primary-dark">
          {numberFormatter.format(car.price)} €
        </p>
        <ButtonLink
          className="w-full uppercase"
          to={`/auto-usate/${car.id}`}
        >
          {buttonText}
        </ButtonLink>
      </CardFooter>
    </Card>
  );
}
