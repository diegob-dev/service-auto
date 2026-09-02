import type { FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CarStatus } from "@/features/cars/types";
import { adminInputClass } from "../constants";
import type { CarInput } from "../types";
import { ImagesEditor } from "./ImagesEditor";

type CarEditorProps = {
  value: CarInput;
  busy: boolean;
  onChange: (value: CarInput) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onImagesChanged: () => Promise<void>;
};

const textFields: Array<[keyof CarInput, string]> = [
  ["brand", "Marca"], ["model", "Modello"], ["version", "Versione"],
  ["slug", "Slug URL"], ["fuel", "Alimentazione"],
  ["transmission", "Cambio"], ["color", "Colore"],
];

const numberFields = [
  ["year", "Anno"], ["kilometers", "Chilometri"],
  ["price", "Prezzo"], ["power_cv", "Potenza CV"],
] as const;

export function CarEditor(props: CarEditorProps) {
  const { value, busy, onChange, onClose, onSubmit, onImagesChanged } = props;
  const set = (key: keyof CarInput, next: unknown) => onChange({ ...value, [key]: next });

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/55 p-4">
      <div className="mx-auto max-w-3xl rounded-xl bg-background p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl uppercase">{value.id ? "Modifica auto" : "Nuova auto"}</h2>
          <Button type="button" variant="ghost" size="icon" aria-label="Chiudi" onClick={onClose}><X /></Button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {textFields.map(([key, label]) => (
              <label key={key} className="text-sm font-semibold">
                {label}
                <input className={`${adminInputClass} mt-1`} value={String(value[key] ?? "")} required={key === "brand" || key === "model" || key === "slug"} onChange={(event) => set(key, event.target.value || null)} />
              </label>
            ))}
            {numberFields.map(([key, label]) => (
              <label key={key} className="text-sm font-semibold">
                {label}
                <input className={`${adminInputClass} mt-1`} type="number" min={key === "year" ? 1900 : 0} max={key === "year" ? 2100 : undefined} required={key !== "power_cv"} value={String(value[key] ?? "")} onChange={(event) => set(key, event.target.value === "" ? null : Number(event.target.value))} />
              </label>
            ))}
            <label className="text-sm font-semibold">
              Stato
              <select className={`${adminInputClass} mt-1`} value={value.status} onChange={(event) => set("status", event.target.value as CarStatus)}>
                <option value="draft">Bozza</option><option value="published">Pubblicata</option><option value="sold">Venduta</option>
              </select>
            </label>
            <label className="flex items-center gap-2 pt-7 font-semibold">
              <input type="checkbox" checked={value.featured} onChange={(event) => set("featured", event.target.checked)} /> In evidenza
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Descrizione
              <textarea className={`${adminInputClass} mt-1 min-h-28`} value={value.description ?? ""} onChange={(event) => set("description", event.target.value || null)} />
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Chiudi</Button>
            <Button type="submit" disabled={busy}>{busy ? "Salvataggio…" : "Salva auto"}</Button>
          </div>
        </form>
        {value.id ? <ImagesEditor car={{ ...value, id: value.id }} onChanged={onImagesChanged} /> : <p className="mt-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">Salva prima l’auto per poter aggiungere le immagini.</p>}
      </div>
    </div>
  );
}
