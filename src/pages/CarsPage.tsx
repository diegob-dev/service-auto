import { Section } from "@/app/layouts/Section";
import { CarsList } from "@/features/cars/CarsList";
import { usePublishedCars } from "@/features/cars/hooks";

export function CarsPage() {
  const { data: cars, isLoading, isError } = usePublishedCars();

  return (
    <Section height="md">
      <CarsList cars={cars} isLoading={isLoading} isError={isError} />
    </Section>
  );
}
