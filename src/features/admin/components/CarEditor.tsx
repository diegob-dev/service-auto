import { useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CarStatus } from "@/features/cars/types";
import { adminInputClass } from "../constants";
import type { CarInput } from "../types";
import { ImagesEditor } from "./ImagesEditor";
import { buildCarSlug } from "@/features/cars/slug";

type CarEditorProps = {
  value: CarInput;
  busy: boolean;
  showLicensePlate: boolean;
  onChange: (value: CarInput) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<boolean>;
  onImagesChanged: () => Promise<void>;
};

const textFields: Array<[keyof CarInput, string]> = [
  ["brand", "Marca"], ["model", "Modello"], ["version", "Versione"],
  ["license_plate", "Targa (solo admin)"],
  ["fuel", "Alimentazione"],
  ["transmission", "Cambio"], ["color", "Colore"],
];

const numberFields = [
  ["year", "Anno"], ["kilometers", "Chilometri"],
  ["price", "Prezzo"], ["power_cv", "Potenza CV"],
] as const;

export function CarEditor(props: CarEditorProps) {
  const { value, busy, showLicensePlate, onChange, onClose, onSubmit, onImagesChanged } = props;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const formRef = useRef<HTMLFormElement>(null);
  const set = (key: keyof CarInput, next: unknown) => onChange({ ...value, [key]: next });
  const slugPreview = value.id ? value.slug : buildCarSlug(value);

  function continueToDetails() {
    if (formRef.current?.reportValidity()) setStep(2);
  }

  function goToStep(nextStep: 1 | 2 | 3 | 4) {
    if (busy || (!value.id && nextStep > 2)) return;
    if (nextStep === 2 && step === 1 && !formRef.current?.reportValidity()) return;
    setStep(nextStep);
  }

  async function saveAndContinue(event: FormEvent<HTMLFormElement>) {
    if (await onSubmit(event)) setStep(3);
  }

  async function saveAndFinish(event: FormEvent<HTMLFormElement>) {
    if (await onSubmit(event)) onClose();
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (step === 1) {
      event.preventDefault();
      continueToDetails();
      return;
    }
    void saveAndContinue(event);
  }

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/55 p-4">
      <div className="mx-auto max-w-3xl rounded-xl bg-background p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl uppercase">{value.id ? "Modifica auto" : "Nuova auto"}</h2>
          <Button type="button" variant="ghost" size="icon" aria-label="Chiudi" onClick={onClose}><X /></Button>
        </div>

        <ol className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Passaggi di configurazione">
          {["Dati auto", "Descrizione e optional", "Immagini", "Riepilogo e pubblicazione"].map((label, index) => {
            const number = (index + 1) as 1 | 2 | 3 | 4;
            const canOpen = Boolean(value.id) || number <= 2;
            return (
              <li key={label} className={`border-t-4 ${step >= number ? "border-primary" : "border-border"}`}>
                <button
                  type="button"
                  disabled={!canOpen || busy}
                  aria-current={step === number ? "step" : undefined}
                  aria-label={`Vai al passaggio ${number}: ${label}`}
                  className={`w-full rounded-b-md px-1 py-2 text-left text-xs font-semibold transition-colors sm:text-sm ${step === number ? "bg-primary/10 text-foreground" : canOpen ? "text-muted-foreground hover:bg-muted hover:text-foreground" : "cursor-not-allowed text-muted-foreground/50"}`}
                  onClick={() => goToStep(number)}
                >
                  <span className="block text-[0.7rem] uppercase tracking-wide text-muted-foreground">Passaggio {number}</span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>

        {step < 3 && (
          <form ref={formRef} onSubmit={handleFormSubmit}>
            <div hidden={step !== 1} className="grid gap-4 md:grid-cols-2">
            {textFields.map(([key, label]) => (
              key === "license_plate" && !showLicensePlate ? null :
              <label key={key} className="text-sm font-semibold">
                {label}
                <input className={`${adminInputClass} mt-1`} value={String(value[key] ?? "")} required={key === "brand" || key === "model"} onChange={(event) => set(key, event.target.value || null)} />
              </label>
            ))}
            {numberFields.map(([key, label]) => (
              <label key={key} className="text-sm font-semibold">
                {label}
                <input className={`${adminInputClass} mt-1`} type="number" min={key === "year" ? 1900 : 0} max={key === "year" ? 2100 : undefined} value={String(value[key] ?? "")} onChange={(event) => set(key, event.target.value === "" ? null : Number(event.target.value))} />
              </label>
            ))}
            <div className="rounded-lg bg-muted p-3 text-sm md:col-span-2">
              <p className="font-semibold">URL della pagina</p>
              <p className="mt-1 break-all text-muted-foreground">/auto-usate/{slugPreview}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Viene creato automaticamente e rimane stabile dopo il primo salvataggio.
              </p>
            </div>
            </div>

            <div hidden={step !== 2} className="grid gap-5">
              <label className="text-sm font-semibold">
              Descrizione
              <textarea className={`${adminInputClass} mt-1 min-h-28`} value={value.description ?? ""} onChange={(event) => set("description", event.target.value || null)} />
            </label>
              <label className="text-sm font-semibold">
              Optional e dotazioni
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                Inserisci un optional per riga, ad esempio “Navigatore”, “Sedili riscaldati” o “Telecamera posteriore”.
              </span>
              <textarea
                className={`${adminInputClass} mt-2 min-h-36`}
                value={value.optional_features.join("\n")}
                placeholder={"Navigatore satellitare\nSedili riscaldati\nTelecamera posteriore"}
                onChange={(event) => set("optional_features", event.target.value.split("\n"))}
              />
            </label>
            </div>

            <div className="mt-7 flex flex-wrap justify-between gap-2">
              <Button type="button" variant="outline" onClick={step === 1 ? onClose : () => setStep(1)}>
                {step === 1 ? "Annulla" : "Indietro"}
              </Button>
              {step === 1 ? (
                <Button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    continueToDetails();
                  }}
                >
                  Avanti
                </Button>
              ) : (
                <Button type="submit" disabled={busy}>
                  {busy ? "Salvataggio…" : value.id ? "Salva e continua" : "Crea auto e continua"}
                </Button>
              )}
            </div>
          </form>
        )}

        {step === 3 && value.id && (
          <>
            <ImagesEditor car={{ ...value, id: value.id }} onChanged={onImagesChanged} />
            <div className="mt-7 flex flex-wrap justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>Indietro</Button>
              <Button type="button" onClick={() => setStep(4)}>Vai al riepilogo</Button>
            </div>
          </>
        )}

        {step === 4 && value.id && (
          <form onSubmit={(event) => void saveAndFinish(event)}>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border bg-card p-5">
                <h3 className="text-lg font-bold">Dati dell’auto</h3>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  {[
                    ["Marca e modello", `${value.brand} ${value.model}`],
                    ["Versione", value.version || "-"],
                    ...(showLicensePlate ? [["Targa", value.license_plate || "-"]] : []),
                    ["Anno", value.year ?? "-"],
                    ["Chilometri", value.kilometers == null ? "-" : `${value.kilometers.toLocaleString("it-IT")} km`],
                    ["Prezzo", value.price == null ? "-" : `${value.price.toLocaleString("it-IT")} €`],
                    ["Alimentazione", value.fuel || "-"],
                    ["Cambio", value.transmission || "-"],
                    ["Colore", value.color || "-"],
                    ["Potenza", value.power_cv == null ? "-" : `${value.power_cv} CV`],
                    ["Immagini", value.car_images?.length ?? 0],
                  ].map(([label, detail]) => (
                    <div key={label}>
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 font-semibold">{detail}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="rounded-xl border bg-card p-5">
                <h3 className="text-lg font-bold">Descrizione e optional</h3>
                <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                  {value.description?.trim() || "Nessuna descrizione inserita."}
                </p>
                {value.optional_features.filter((feature) => feature.trim()).length > 0 ? (
                  <ul className="mt-4 list-inside list-disc space-y-1 text-sm">
                    {value.optional_features.filter((feature) => feature.trim()).map((feature, index) => (
                      <li key={`${feature}-${index}`}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Nessun optional inserito.</p>
                )}
              </section>
            </div>

            <section className="mt-6 rounded-xl bg-muted p-5">
              <h3 className="text-lg font-bold">Pubblicazione</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Controlla il riepilogo, quindi scegli lo stato finale dell’auto.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Stato
                  <select className={`${adminInputClass} mt-1`} value={value.status} onChange={(event) => set("status", event.target.value as CarStatus)}>
                    <option value="draft">Bozza</option>
                    <option value="published">Pubblicata</option>
                    <option value="sold">Venduta</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 pt-7 font-semibold">
                  <input type="checkbox" checked={value.featured} onChange={(event) => set("featured", event.target.checked)} /> In evidenza
                </label>
              </div>
            </section>

            <div className="mt-7 flex flex-wrap justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>Indietro</Button>
              <Button type="submit" disabled={busy}>
                {busy
                  ? "Salvataggio…"
                  : value.status === "published"
                    ? "Pubblica auto"
                    : value.status === "sold"
                      ? "Salva come venduta"
                      : "Salva come bozza"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
