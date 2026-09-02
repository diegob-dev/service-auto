import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatter, numberFormatter } from "@/lib/formatters";
import type { CarWithImages } from "@/features/cars/types";

type CarsPanelProps = {
  cars: CarWithImages[];
  onCreate: () => void;
  onEdit: (car: CarWithImages) => void;
  onDelete: (car: CarWithImages) => void | Promise<void>;
};

export function CarsPanel({ cars, onCreate, onEdit, onDelete }: CarsPanelProps) {
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={onCreate}><Plus /> Nuova auto</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {cars.map((car) => (
          <Card key={car.id}>
            <CardHeader><CardTitle>{car.brand} {car.model}</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{car.year}</span><span>·</span>
                <span>{numberFormatter.format(car.kilometers)} km</span><span>·</span>
                <strong className="text-foreground">{currencyFormatter.format(car.price)}</strong>
                <span className="rounded bg-accent px-2 py-0.5">{car.status}</span>
                {car.featured && <span className="rounded bg-primary/15 px-2 py-0.5 text-primary-dark">In evidenza</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onEdit(car)}><Pencil /> Modifica</Button>
                <Button variant="outline" className="text-red-600" onClick={() => void onDelete(car)}><Trash2 /> Elimina</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
