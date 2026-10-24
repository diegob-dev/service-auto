import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { attachArchivedImage, deleteArchivedImage, listArchivedImages, uploadArchivedImage, type ArchivedImage } from "../imageArchive";
import { X } from "lucide-react";
import { useDialog } from "@/lib/useDialog";

function PhotoDetails({ image, onClose }: { image: ArchivedImage; onClose: () => void }) {
  const ref = useDialog<HTMLDivElement>(onClose);
  return <div className="fixed inset-0 z-70 overflow-y-auto bg-black/75 p-4" onClick={onClose}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Dettagli foto" tabIndex={-1}
      className="mx-auto max-w-4xl rounded-xl bg-background p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between gap-4"><h3 className="text-xl font-bold">Dettagli foto</h3>
        <Button type="button" variant="outline" onClick={onClose}>Chiudi foto</Button></div>
      <img src={image.previewUrl} alt={image.caption || "Foto in archivio"} className="max-h-[65vh] w-full object-contain" />
      <dl className="mt-4 space-y-2 text-sm">
        {image.original_name && <div><dt className="font-semibold">Nome file</dt><dd className="break-words">{image.original_name}</dd></div>}
        <div><dt className="font-semibold">Data di caricamento</dt><dd>{new Date(image.received_at).toLocaleString("it-IT")}</dd></div>
        <div><dt className="font-semibold">Data di creazione / scatto</dt><dd>{image.captured_at ? new Date(image.captured_at).toLocaleString("it-IT") : "Non disponibile: la foto non contiene una data di scatto nei metadati."}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">La data di scatto proviene dai metadati originali della foto, quando presenti. L’orario è quello registrato dalla fotocamera.</p>
    </div>
  </div>;
}

export function ImageArchive({ carId, onChanged, onBusyChanged, pendingImages = [], onStage }: {
  carId?: string;
  onChanged?: () => Promise<void>;
  onBusyChanged?: (busy: boolean) => void;
  pendingImages?: ArchivedImage[];
  onStage?: (images: ArchivedImage[]) => void;
}) {
  const [images, setImages] = useState<ArchivedImage[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [opened, setOpened] = useState<ArchivedImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function removeImage(image: ArchivedImage) {
    if (busy || !window.confirm("Eliminare questa foto dall’archivio?")) return;
    setBusy(true); onBusyChanged?.(true); setError(""); setMessage("");
    try {
      await deleteArchivedImage(image);
      setImages((previous) => previous.filter((item) => item.id !== image.id));
      setSelected((previous) => previous.filter((id) => id !== image.id));
      onStage?.(pendingImages.filter((item) => item.id !== image.id));
      if (opened?.id === image.id) setOpened(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Eliminazione non riuscita"); }
    finally { setBusy(false); onBusyChanged?.(false); }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    if (busy || loading) return;
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []).filter((file) => file.size > 0);
    if (!files.length) return;
    setBusy(true); setUploading(true); onBusyChanged?.(true); setError(""); setMessage("");
    const failures: string[] = [];
    let count = 0;
    try {
      for (const file of files) {
        try { await uploadArchivedImage(file); count++; }
        catch (caught) { failures.push(`${file.name}: ${caught instanceof Error ? caught.message : "Caricamento non riuscito"}`); }
      }
      await load();
      if (count) setMessage(`${count} foto caricate nell’archivio.`);
      if (failures.length) setError(failures.join(" · "));
    } finally { input.value = ""; setBusy(false); setUploading(false); onBusyChanged?.(false); }
  }

  async function load(append = false) {
    setLoading(true);
    setError("");
    try {
      const next = await listArchivedImages(append ? images.length : 0);
      setImages((previous) => append ? [...previous, ...next] : next);
      if (!append) setSelected([]);
      setHasMore(next.length === 50);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Archivio non disponibile");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    void listArchivedImages().then((next) => {
      if (active) { setImages(next); setHasMore(next.length === 50); }
    }).catch((caught) => {
      if (active) setError(caught instanceof Error ? caught.message : "Archivio non disponibile");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function attach() {
    if (!carId || !selected.length || busy) return;
    if (onStage) {
      const added = selected.flatMap((id) => images.find((image) => image.id === id) ?? []);
      onStage([...pendingImages, ...added.filter((image) => !pendingImages.some((pending) => pending.id === image.id))]);
      setSelected([]);
      setMessage("Le foto saranno associate al salvataggio finale dell’auto.");
      return;
    }
    setBusy(true);
    onBusyChanged?.(true);
    setError("");
    setMessage("");
    let completed = 0;
    let failure = "";
    try {
      // Selection order determines the order in the car gallery.
      for (const id of selected) {
        const image = images.find((item) => item.id === id);
        if (!image) continue;
        await attachArchivedImage(image, carId);
        completed++;
      }
    } catch (caught) {
      failure = caught instanceof Error ? caught.message : "Associazione non riuscita";
    } finally {
      await load();
      try { await onChanged?.(); }
      catch { failure ||= "Aggiorna la scheda per visualizzare le foto associate."; }
      setMessage(completed ? `${completed} foto associate all’auto e rimosse dall’archivio.` : "");
      if (failure) setError(failure + " Le foto non associate restano nell’archivio. Aggiorna prima di riprovare.");
      setBusy(false);
      onBusyChanged?.(false);
    }
  }

  return <section className="my-6 rounded-xl border bg-card p-5" aria-label="Archivio foto">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-xl font-bold">Archivio foto</h3>
      <Button type="button" variant="outline" disabled={busy || loading} onClick={() => void load()}>Aggiorna archivio</Button>
    </div>
    <input ref={fileInput} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif"
      aria-label="Aggiungi foto all’archivio" className="hidden" disabled={busy || loading}
      onChange={(event) => void upload(event)} />
    <Button type="button" className="mt-4" disabled={busy || loading} onClick={() => fileInput.current?.click()}>
      {uploading ? "Caricamento…" : "Aggiungi +"}
    </Button>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
    {onStage && pendingImages.length > 0 && <div className="mt-4">
      <p className="text-sm font-semibold">Foto da associare al salvataggio ({pendingImages.length})</p>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">{pendingImages.map((image) => <article key={image.id} className="overflow-hidden rounded-lg border">
        <img src={image.previewUrl} alt={image.caption || "Foto selezionata"} className="aspect-video w-full object-cover" />
        <Button type="button" variant="ghost" disabled={busy} onClick={() => onStage(pendingImages.filter((item) => item.id !== image.id))}>Rimuovi dalla selezione</Button>
      </article>)}</div>
    </div>}
    {loading && <p role="status" className="mt-4">Caricamento archivio…</p>}
    {!loading && !error && !images.length && <p className="mt-4 text-muted-foreground">Nessuna foto in attesa.</p>}
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((image) => <article key={image.id} className="relative overflow-hidden rounded-lg border">
        <button type="button" disabled={busy || loading} title="Elimina foto"
          aria-label={`Elimina foto: ${image.caption || image.original_name || "Foto in archivio"}`}
          className="absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/65 text-white shadow transition-colors hover:bg-red-600 disabled:opacity-50"
          onClick={() => void removeImage(image)}><X size={16} aria-hidden="true" /></button>
        <button type="button" className="block w-full cursor-zoom-in" onClick={() => setOpened(image)} aria-label={`Apri foto: ${image.caption || image.original_name || "Foto in archivio"}`}>
          <img src={image.previewUrl} alt={image.caption || "Foto in archivio"} loading="lazy" className="aspect-video w-full object-cover" />
        </button>
        <span className="flex items-start gap-2 p-3 text-sm">
          {carId && <input type="checkbox" disabled={busy || loading || pendingImages.some((pending) => pending.id === image.id)} checked={selected.includes(image.id) || pendingImages.some((pending) => pending.id === image.id)}
            aria-label={`Seleziona ${image.caption || "foto"}`}
            onChange={(event) => setSelected((previous) => event.target.checked ? [...previous, image.id] : previous.filter((id) => id !== image.id))} />}
          <span className="min-w-0 break-words">{image.caption || image.original_name || "Foto in archivio"}<span className="block text-xs text-muted-foreground">Caricata il {new Date(image.received_at).toLocaleString("it-IT")}</span></span>
        </span>
      </article>)}
    </div>
    <div className="mt-4 flex flex-wrap gap-3">
      {hasMore && <Button type="button" variant="outline" disabled={busy || loading} onClick={() => void load(true)}>Carica altre foto</Button>}
      {carId && <Button type="button" disabled={busy || loading || !selected.length} onClick={() => void attach()}>
        {busy && !uploading ? "Associazione in corso…" : `Associa foto selezionate (${selected.length})`}
      </Button>}
    </div>
    {opened && <PhotoDetails image={opened} onClose={() => setOpened(null)} />}
  </section>;
}
