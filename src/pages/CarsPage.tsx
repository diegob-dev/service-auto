import { Section } from "@/app/layouts/Section";
import { CarsList } from "@/features/cars/CarsList";
import { usePublishedCars } from "@/features/cars/hooks";

export function CarsPage() {
  const { data: cars, isLoading, isError } = usePublishedCars();

  return (
    <Section height="sm">
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-wide uppercase sm:text-5xl">
          Auto usate
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Scopri le auto disponibili. Consulta foto e caratteristiche e
          contattaci per informazioni o un appuntamento.
        </p>
      </header>
      <CarsList
        cars={cars}
        isLoading={isLoading}
        isError={isError}
        showFilters
      />
    </Section>
  );
}
