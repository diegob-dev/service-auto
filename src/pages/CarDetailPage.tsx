import { ArrowLeft, CalendarDays, Check, Fuel, Gauge } from "lucide-react";
import { Section } from "@/app/layouts/Section";
import { ButtonLink } from "@/components/ui/button-link";
import { CarGallery } from "@/features/cars/CarGallery";
import { usePublishedCars } from "@/features/cars/hooks";
import { formatCarPrice, formatCarKilometers } from "@/lib/formatters";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const missingValue = "-";

function CarDetailLoading() {
  return (
    <Section height="sm" size="large">
      <div role="status" aria-label="Caricamento auto" className="w-full animate-pulse">
        <span className="sr-only">Caricamento dettagli auto in corso…</span>
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="mt-8 h-12 max-w-xl rounded bg-muted" />
        <div className="mt-4 h-8 w-32 rounded bg-muted" />
        <div className="mt-8 aspect-video max-h-[72vh] w-full rounded-2xl bg-muted" />
        <div className="mt-5 flex gap-3">
          <div className="h-10 w-28 rounded-full bg-muted" />
          <div className="h-10 w-36 rounded-full bg-muted" />
          <div className="h-10 w-32 rounded-full bg-muted" />
        </div>
      </div>
    </Section>
  );
}

export function CarDetailPage() {
  const { carSlug } = useParams();
  const { data: cars, isLoading, isError } = usePublishedCars();
  const car = cars?.find(({ slug }) => slug === carSlug);

  useEffect(() => {
    if (!car) return;
    const carName = `${car.brand} ${car.model}`;
    document.title = `${carName} usata | Service SRL`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        `Scopri fotografie, caratteristiche e disponibilità di ${carName} usata presso Service SRL a Vigevano.`,
      );
  }, [car]);

  if (isLoading) return <CarDetailLoading />;
  if (isError) {
    return (
      <Section height="md">
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-6 text-center">
          <h1 className="text-2xl font-bold">Impossibile caricare l’auto</h1>
          <p className="mt-2 text-muted-foreground">Riprova tra qualche istante.</p>
          <ButtonLink className="mt-5" variant="outline" to="/auto-usate">
            Torna alle auto usate
          </ButtonLink>
        </div>
      </Section>
    );
  }
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

  const carName = `${car.brand} ${car.model}`;
  const technicalDetails = [
    ["Anno", car.year ?? missingValue],
    [
      "Chilometri",
      car.kilometers == null
        ? missingValue
        : formatCarKilometers(car.kilometers),
    ],
    ["Alimentazione", car.fuel?.trim() || missingValue],
    ["Cambio", car.transmission?.trim() || missingValue],
    ["Colore", car.color?.trim() || missingValue],
    ["Potenza", car.power_cv == null ? missingValue : `${car.power_cv} CV`],
  ];

  return (
    <Section height="sm" size="large">
      <article className="w-full">
        <ButtonLink
          variant="destructive"
          className="mb-6 px-0"
          to="/auto-usate"
        >
          <ArrowLeft aria-hidden="true" /> Torna alle auto usate
        </ButtonLink>

        <header className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-dark">
              Auto usata
            </p>
            <h1 className="mt-2 font-display text-5xl uppercase leading-none sm:text-6xl">
              {carName}
            </h1>
            {car.version?.trim() && (
              <p className="mt-3 text-xl text-muted-foreground">
                {car.version}
              </p>
            )}
          </div>
          <div className="md:text-right">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Prezzo
            </p>
            <p className="mt-1 text-4xl font-bold text-primary-dark">
              {car.price == null ? missingValue : formatCarPrice(car.price)}
            </p>
          </div>
        </header>

        <CarGallery images={car.car_images} carName={carName} />

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-border">
            <CalendarDays
              size={17}
              className="text-primary-dark"
              aria-hidden="true"
            />{" "}
            {car.year ?? missingValue}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-border">
            <Gauge size={17} className="text-primary-dark" aria-hidden="true" />{" "}
            {car.kilometers == null
              ? missingValue
              : formatCarKilometers(car.kilometers)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-border">
            <Fuel size={17} className="text-primary-dark" aria-hidden="true" />{" "}
            {car.fuel?.trim() || missingValue}
          </span>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-10">
            {car.description?.trim() && (
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary-dark">
                  Panoramica
                </p>
                <h2 className="mt-1 font-display text-4xl uppercase">
                  Descrizione
                </h2>
                <p className="mt-5 max-w-4xl whitespace-pre-line text-lg leading-8 text-muted-foreground">
                  {car.description}
                </p>
              </section>
            )}

            <section>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary-dark">
                Specifiche
              </p>
              <h2 className="mt-1 font-display text-4xl uppercase">
                Caratteristiche tecniche
              </h2>
              <dl className="mt-5 grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-2 xl:grid-cols-3">
                {technicalDetails.map(([label, detail]) => (
                  <div key={label} className="border-b border-r p-5">
                    <dt className="text-sm font-semibold text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1 text-lg font-bold">{detail}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary-dark">
                Equipaggiamento
              </p>
              <h2 className="mt-1 font-display text-4xl uppercase">
                Optional e dotazioni
              </h2>
              {car.optional_features.length > 0 ? (
                <ul className="mt-5 grid gap-x-8 gap-y-4 rounded-2xl border bg-card p-6 sm:grid-cols-2">
                  {car.optional_features.map((feature, index) => (
                    <li
                      key={`${feature}-${index}`}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-dark">
                        <Check size={15} strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-2xl border bg-card p-6 text-muted-foreground">
                  Optional non specificati.
                </p>
              )}
            </section>
          </div>

          <aside className="rounded-2xl bg-secondary p-6 text-secondary-foreground shadow-lg lg:sticky lg:top-24">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary-foreground/65">
              Sei interessato?
            </p>
            <h2 className="mt-2 font-display text-3xl uppercase">
              Richiedi informazioni
            </h2>
            <p className="mt-3 leading-6 text-secondary-foreground/75">
              Contattaci per disponibilità, condizioni e per fissare un
              appuntamento.
            </p>
            <ButtonLink className="mt-6 w-full" size="lg" to="/contatti">
              Contattaci
            </ButtonLink>
            <ButtonLink
              className="mt-3 w-full "
              variant="ghost"
              to="/auto-usate"
            >
              Vedi altre auto
            </ButtonLink>
          </aside>
        </div>
      </article>
    </Section>
  );
}
