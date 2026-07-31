import { Section } from "@/app/layouts/Section";
import { CarsList } from "@/pages/homepage/components/CarsList";
import { useGetCarsList } from "@/pages/homepage/hooks/useGetCarsList";

export function CarsPage() {
  const { data: cars, isLoading, isError } = useGetCarsList();

  return (
    <Section height="md">
      <CarsList cars={cars} isLoading={isLoading} isError={isError} />
    </Section>
  );
}
