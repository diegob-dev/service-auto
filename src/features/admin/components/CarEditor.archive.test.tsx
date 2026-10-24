import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CarEditor } from "./CarEditor";
import { emptyCar } from "../constants";
const photo = { id: "photo", storage_path: "photo.jpg", caption: "Frontale", received_at: "2026-10-24", previewUrl: "/photo.jpg" };
vi.mock("./ImagesEditor", () => ({ ImagesEditor: ({ pendingImages, onPendingImagesChanged }: { pendingImages: unknown[]; onPendingImagesChanged: (images: unknown[]) => void }) => <>
  <span>In attesa: {pendingImages.length}</span>
  <button type="button" onClick={() => onPendingImagesChanged([photo])}>Seleziona dall’archivio</button>
</> }));

describe("Salvataggio finale delle foto archiviate", () => {
  it("mantiene la selezione tra i passaggi e la invia solo al salvataggio finale", async () => {
    const submit = vi.fn(async () => true);
    const close = vi.fn();
    render(<CarEditor value={{ ...emptyCar, id: "car", brand: "Volvo", model: "XC60" }} busy={false}
      onChange={vi.fn()} onClose={close} onSubmit={submit} onImagesChanged={vi.fn(async () => {})} />);
    fireEvent.click(screen.getByRole("button", { name: "Vai al passaggio 3: Immagini" }));
    fireEvent.click(screen.getByText("Seleziona dall’archivio"));
    expect(submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Vai al riepilogo"));
    fireEvent.click(screen.getByRole("button", { name: "Indietro" }));
    expect(screen.getByText("In attesa: 1")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Vai al riepilogo"));
    fireEvent.submit(screen.getByText("Salva come bozza").closest("form")!);
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(submit).toHaveBeenCalledWith(expect.anything(), [photo]);
  });

  it("chiudere senza completare non conferma le foto", () => {
    const submit = vi.fn();
    const close = vi.fn();
    render(<CarEditor value={{ ...emptyCar, id: "car" }} busy={false} onChange={vi.fn()} onClose={close}
      onSubmit={submit} onImagesChanged={vi.fn(async () => {})} />);
    fireEvent.click(screen.getByRole("button", { name: "Vai al passaggio 3: Immagini" }));
    fireEvent.click(screen.getByText("Seleziona dall’archivio"));
    fireEvent.click(screen.getByRole("button", { name: /^Chiudi$/ }));
    expect(close).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });
});
