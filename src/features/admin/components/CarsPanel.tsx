import { useMemo, useState } from "react";
import { FilterX, Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCarPrice, formatCarKilometers } from "@/lib/formatters";
import type { CarWithImages } from "@/features/cars/types";

type CarsPanelProps = {
  cars: CarWithImages[];
  showLicensePlate: boolean;
  onCreate: () => void;
  onEdit: (car: CarWithImages) => void;
  onDelete: (car: CarWithImages) => void | Promise<void>;
};

const emptyFilters = {
  car: "",
  licensePlate: "",
  yearFrom: "",
  yearTo: "",
  kilometersFrom: "",
  kilometersTo: "",
  priceFrom: "",
  priceTo: "",
  status: "",
  featured: "",
};

function isWithinRange(value: number | null, from: string, to: string) {
  if (!from && !to) return true;
  if (value == null) return false;
  return (!from || value >= Number(from)) && (!to || value <= Number(to));
}

export function CarsPanel({
  cars,
  showLicensePlate,
  onCreate,
  onEdit,
  onDelete,
}: CarsPanelProps) {
  const [filters, setFilters] = useState({ ...emptyFilters });
  const statusDisplay = {
    draft: {
      label: "Bozza",
      className: "bg-amber-100 text-amber-800 ring-amber-200",
    },
    published: {
      label: "Pubblicata",
      className: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    },
    sold: {
      label: "Venduta",
      className: "bg-red-100 text-red-700 ring-red-200",
    },
  } as const;
  const filterInputClass =
    "mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm font-normal text-foreground outline-none focus:ring-2 focus:ring-primary";
  const missingValue = (
    <span className="font-mono text-xs font-semibold">-</span>
  );

  const filteredCars = useMemo(
    () =>
      cars.filter((car) => {
        const carSearch =
          `${car.brand} ${car.model} ${car.version ?? ""}`.toLowerCase();
        return (
          carSearch.includes(filters.car.trim().toLowerCase()) &&
          (car.license_plate ?? "")
            .toLowerCase()
            .includes(filters.licensePlate.trim().toLowerCase()) &&
          isWithinRange(car.year, filters.yearFrom, filters.yearTo) &&
          isWithinRange(
            car.kilometers,
            filters.kilometersFrom,
            filters.kilometersTo,
          ) &&
          isWithinRange(car.price, filters.priceFrom, filters.priceTo) &&
          (!filters.status || car.status === filters.status) &&
          (!filters.featured || String(car.featured) === filters.featured)
        );
      }),
    [cars, filters],
  );

  const hasFilters = Object.values(filters).some(Boolean);
  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={onCreate}>
          <Plus /> Nuova auto
        </Button>
      </div>

      <section
        className="mb-5 rounded-xl border bg-card p-5 shadow-sm"
        aria-labelledby="car-filters-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="car-filters-title"
              className="flex items-center gap-2 text-lg font-bold"
            >
              <SlidersHorizontal size={20} aria-hidden="true" /> Filtri
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredCars.length}{" "}
              {filteredCars.length === 1 ? "auto trovata" : "auto trovate"} su{" "}
              {cars.length}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasFilters}
            onClick={() => setFilters({ ...emptyFilters })}
          >
            <FilterX /> Azzera filtri
          </Button>
        </div>

        <div className={`mt-5 grid gap-4 sm:grid-cols-2 ${showLicensePlate ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
          <label className="text-sm font-semibold">
            Auto
            <input
              className={filterInputClass}
              aria-label="Filtra per auto"
              placeholder="Marca, modello o versione"
              value={filters.car}
              onChange={(event) => setFilter("car", event.target.value)}
            />
          </label>
          {showLicensePlate && (
            <label className="text-sm font-semibold">
              Targa
              <input
                className={filterInputClass}
                aria-label="Filtra per targa"
                placeholder="Es. AB123CD"
                value={filters.licensePlate}
                onChange={(event) =>
                  setFilter("licensePlate", event.target.value)
                }
              />
            </label>
          )}
          <label className="text-sm font-semibold">
            Stato
            <select
              className={filterInputClass}
              aria-label="Filtra per stato"
              value={filters.status}
              onChange={(event) => setFilter("status", event.target.value)}
            >
              <option value="">Tutti gli stati</option>
              <option value="draft">Bozza</option>
              <option value="published">Pubblicata</option>
              <option value="sold">Venduta</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            In evidenza
            <select
              className={filterInputClass}
              aria-label="Filtra per evidenza"
              value={filters.featured}
              onChange={(event) => setFilter("featured", event.target.value)}
            >
              <option value="">Tutte le auto</option>
              <option value="true">Solo in evidenza</option>
              <option value="false">Non in evidenza</option>
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <fieldset className="rounded-xl border bg-muted/35 p-4">
            <legend className="px-1 text-sm font-bold">Anno</legend>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-muted-foreground">
                Da
                <input
                  className={filterInputClass}
                  aria-label="Anno da"
                  type="number"
                  placeholder="Es. 2018"
                  value={filters.yearFrom}
                  onChange={(event) =>
                    setFilter("yearFrom", event.target.value)
                  }
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                A
                <input
                  className={filterInputClass}
                  aria-label="Anno a"
                  type="number"
                  placeholder="Es. 2026"
                  value={filters.yearTo}
                  onChange={(event) => setFilter("yearTo", event.target.value)}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border bg-muted/35 p-4">
            <legend className="px-1 text-sm font-bold">Chilometri</legend>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-muted-foreground">
                Da
                <input
                  className={filterInputClass}
                  aria-label="Chilometri da"
                  type="number"
                  min="0"
                  placeholder="Es. 0"
                  value={filters.kilometersFrom}
                  onChange={(event) =>
                    setFilter("kilometersFrom", event.target.value)
                  }
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                A
                <input
                  className={filterInputClass}
                  aria-label="Chilometri a"
                  type="number"
                  min="0"
                  placeholder="Es. 100.000"
                  value={filters.kilometersTo}
                  onChange={(event) =>
                    setFilter("kilometersTo", event.target.value)
                  }
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border bg-muted/35 p-4">
            <legend className="px-1 text-sm font-bold">Prezzo</legend>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-muted-foreground">
                Da
                <input
                  className={filterInputClass}
                  aria-label="Prezzo da"
                  type="number"
                  min="0"
                  placeholder="Es. 10.000"
                  value={filters.priceFrom}
                  onChange={(event) =>
                    setFilter("priceFrom", event.target.value)
                  }
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                A
                <input
                  className={filterInputClass}
                  aria-label="Prezzo a"
                  type="number"
                  min="0"
                  placeholder="Es. 40.000"
                  value={filters.priceTo}
                  onChange={(event) => setFilter("priceTo", event.target.value)}
                />
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-5xl border-collapse text-left text-sm">
          <thead className="bg-muted/80 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Auto
              </th>
              {showLicensePlate && (
                <th scope="col" className="px-4 py-3 font-semibold">Targa</th>
              )}
              <th scope="col" className="px-4 py-3 font-semibold">
                Anno
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Chilometri
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Prezzo
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Stato
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                In evidenza
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCars.map((car) => (
              <tr key={car.id} className="transition-colors hover:bg-muted/40">
                <th
                  scope="row"
                  className="px-4 py-4 font-semibold text-foreground"
                >
                  {car.brand} {car.model}
                  {car.version && (
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {car.version}
                    </span>
                  )}
                </th>
                {showLicensePlate && (
                  <td className="px-4 py-4">{car.license_plate || missingValue}</td>
                )}
                <td className="px-4 py-4">{car.year ?? missingValue}</td>
                <td className="px-4 py-4">
                  {car.kilometers == null
                    ? missingValue
                    : formatCarKilometers(car.kilometers)}
                </td>
                <td className="px-4 py-4 font-semibold">
                  {car.price == null ? missingValue : formatCarPrice(car.price)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusDisplay[car.status].className}`}
                  >
                    <span
                      className="size-1.5 rounded-full bg-current"
                      aria-hidden="true"
                    />
                    {statusDisplay[car.status].label}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {car.featured ? (
                    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 ring-1 ring-inset ring-blue-200">
                      Sì
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(car)}
                    >
                      <Pencil /> Modifica
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => void onDelete(car)}
                    >
                      <Trash2 /> Elimina
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCars.length === 0 && (
              <tr>
                <td
                  colSpan={showLicensePlate ? 8 : 7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  {cars.length === 0
                    ? "Nessuna auto presente. Aggiungi la prima auto per iniziare."
                    : "Nessuna auto corrisponde ai filtri selezionati."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
