import { useMemo, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarCard } from "./CarCard";
import type { CarWithImages } from "./types";

type CarsListProps = {
  cars?: CarWithImages[];
  isLoading: boolean;
  isError: boolean;
  showFilters?: boolean;
};

const noCars: CarWithImages[] = [];

const emptyFilters = {
  search: "",
  yearFrom: "",
  yearTo: "",
  kilometersFrom: "",
  kilometersTo: "",
  priceFrom: "",
  priceTo: "",
  fuel: "",
  transmission: "",
};

function isWithinRange(value: number | null, from: string, to: string) {
  if (!from && !to) return true;
  if (value == null) return false;
  return (!from || value >= Number(from)) && (!to || value <= Number(to));
}

export const CarsList = ({ cars, isLoading, isError, showFilters = false }: CarsListProps) => {
  const [filters, setFilters] = useState({ ...emptyFilters });
  const availableCars = cars ?? noCars;
  const filterInputClass = "mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary";

  const fuelOptions = useMemo(() => (
    [...new Set(availableCars.map((car) => car.fuel?.trim()).filter(Boolean))].sort()
  ), [availableCars]);
  const transmissionOptions = useMemo(() => (
    [...new Set(availableCars.map((car) => car.transmission?.trim()).filter(Boolean))].sort()
  ), [availableCars]);
  const filteredCars = useMemo(() => availableCars.filter((car) => {
    const searchableName = `${car.brand} ${car.model} ${car.version ?? ""}`.toLowerCase();
    return (
      searchableName.includes(filters.search.trim().toLowerCase())
      && isWithinRange(car.year, filters.yearFrom, filters.yearTo)
      && isWithinRange(car.kilometers, filters.kilometersFrom, filters.kilometersTo)
      && isWithinRange(car.price, filters.priceFrom, filters.priceTo)
      && (!filters.fuel || car.fuel?.trim() === filters.fuel)
      && (!filters.transmission || car.transmission?.trim() === filters.transmission)
    );
  }), [availableCars, filters]);
  const hasFilters = Object.values(filters).some(Boolean);
  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  if (isLoading) return <p>Caricamento...</p>;
  if (isError) return <p>Errore nel caricamento delle auto.</p>;
  return (
    <div>
      {availableCars.length ? (
        <>
          {showFilters && (
            <section className="mb-8 rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="public-car-filters-title">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="public-car-filters-title" className="flex items-center gap-2 text-xl font-bold">
                    <SlidersHorizontal size={20} aria-hidden="true" /> Trova la tua auto
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {filteredCars.length} {filteredCars.length === 1 ? "auto disponibile" : "auto disponibili"}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" disabled={!hasFilters} onClick={() => setFilters({ ...emptyFilters })}>
                  <RotateCcw /> Azzera filtri
                </Button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <label className="text-sm font-semibold">
                  Cerca
                  <span className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-muted-foreground" size={17} aria-hidden="true" />
                    <input className={`${filterInputClass} pl-9`} aria-label="Cerca auto" placeholder="Marca, modello o versione" value={filters.search} onChange={(event) => setFilter("search", event.target.value)} />
                  </span>
                </label>
                <label className="text-sm font-semibold">
                  Alimentazione
                  <select className={filterInputClass} value={filters.fuel} onChange={(event) => setFilter("fuel", event.target.value)}>
                    <option value="">Tutte</option>
                    {fuelOptions.map((fuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Cambio
                  <select className={filterInputClass} value={filters.transmission} onChange={(event) => setFilter("transmission", event.target.value)}>
                    <option value="">Tutti</option>
                    {transmissionOptions.map((transmission) => <option key={transmission} value={transmission}>{transmission}</option>)}
                  </select>
                </label>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {[
                  { label: "Anno", fromKey: "yearFrom", toKey: "yearTo", fromPlaceholder: "Es. 2018", toPlaceholder: "Es. 2026" },
                  { label: "Chilometri", fromKey: "kilometersFrom", toKey: "kilometersTo", fromPlaceholder: "Es. 0", toPlaceholder: "Es. 100.000" },
                  { label: "Prezzo", fromKey: "priceFrom", toKey: "priceTo", fromPlaceholder: "Es. 10.000", toPlaceholder: "Es. 40.000" },
                ].map(({ label, fromKey, toKey, fromPlaceholder, toPlaceholder }) => (
                  <fieldset key={label} className="rounded-xl border bg-muted/35 p-4">
                    <legend className="px-1 text-sm font-bold">{label}</legend>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Da
                        <input className={filterInputClass} aria-label={`${label} da`} type="number" min="0" placeholder={fromPlaceholder} value={filters[fromKey as keyof typeof filters]} onChange={(event) => setFilter(fromKey as keyof typeof filters, event.target.value)} />
                      </label>
                      <label className="text-xs font-semibold text-muted-foreground">
                        A
                        <input className={filterInputClass} aria-label={`${label} a`} type="number" min="0" placeholder={toPlaceholder} value={filters[toKey as keyof typeof filters]} onChange={(event) => setFilter(toKey as keyof typeof filters, event.target.value)} />
                      </label>
                    </div>
                  </fieldset>
                ))}
              </div>
            </section>
          )}

          {filteredCars.length ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} buttonText="Scopri di più" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="font-semibold">Nessuna auto corrisponde ai filtri selezionati.</p>
              <Button className="mt-4" type="button" variant="outline" onClick={() => setFilters({ ...emptyFilters })}>
                <RotateCcw /> Azzera filtri
              </Button>
            </div>
          )}
        </>
      ) : (
        <p>Nessuna auto disponibile.</p>
      )}
    </div>
  );
};
