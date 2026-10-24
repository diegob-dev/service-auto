import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImageArchive } from "./ImageArchive";
import { attachArchivedImage, deleteArchivedImage, listArchivedImages, uploadArchivedImage } from "../imageArchive";

vi.mock("../imageArchive", () => ({ listArchivedImages: vi.fn(), attachArchivedImage: vi.fn(), uploadArchivedImage: vi.fn(), deleteArchivedImage: vi.fn() }));
const images = ["Frontale", "Interni"].map((caption, index) => ({
  id: String(index), storage_path: `${index}.jpg`, caption, received_at: "2026-10-21T10:00:00Z", previewUrl: `/foto${index}.jpg`,
}));

describe("Archivio foto", () => {
  it("elimina dalla X senza aprire la foto e rimuove la selezione provvisoria", async () => {
    vi.mocked(listArchivedImages).mockResolvedValue(images);
    vi.mocked(deleteArchivedImage).mockResolvedValue(undefined);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const stage = vi.fn();
    try {
      render(<ImageArchive carId="car" onStage={stage} pendingImages={[images[0]]} />);
      fireEvent.click(await screen.findByRole("button", { name: "Elimina foto: Frontale" }));
      await waitFor(() => expect(screen.queryByRole("button", { name: "Apri foto: Frontale" })).not.toBeInTheDocument());
      expect(deleteArchivedImage).toHaveBeenCalledWith(images[0]);
      expect(stage).toHaveBeenCalledWith([]);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    } finally { confirm.mockRestore(); }
  });
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(listArchivedImages).mockResolvedValue(images);
    vi.mocked(attachArchivedImage).mockResolvedValue(undefined);
  });

  it("prepara la selezione senza consumare le foto prima del salvataggio finale", async () => {
    const stage = vi.fn();
    render(<ImageArchive carId="car" onStage={stage} pendingImages={[]} />);
    fireEvent.click(await screen.findByLabelText("Seleziona Frontale"));
    fireEvent.click(screen.getByRole("button", { name: "Associa foto selezionate (1)" }));
    expect(stage).toHaveBeenCalledWith([images[0]]);
    expect(attachArchivedImage).not.toHaveBeenCalled();
    expect(screen.getByText("Frontale")).toBeInTheDocument();
    expect(screen.getByText("Le foto saranno associate al salvataggio finale dell’auto.")).toBeInTheDocument();
  });

  it("mostra l’archivio riservato anche senza un’auto, senza pulsanti di associazione", async () => {
    render(<ImageArchive />);
    expect(await screen.findByText("Frontale")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(attachArchivedImage).not.toHaveBeenCalled();
  });

  it("associa nell’ordine selezionato e aggiorna archivio e foto dell’auto", async () => {
    const changed = vi.fn(async () => undefined);
    const busy = vi.fn();
    render(<ImageArchive carId="car" onChanged={changed} onBusyChanged={busy} />);
    fireEvent.click(await screen.findByLabelText("Seleziona Interni"));
    fireEvent.click(screen.getByLabelText("Seleziona Frontale"));
    vi.mocked(listArchivedImages).mockResolvedValue([]);
    fireEvent.click(screen.getByRole("button", { name: "Associa foto selezionate (2)" }));
    await screen.findByText("2 foto associate all’auto e rimosse dall’archivio.");
    expect(vi.mocked(attachArchivedImage).mock.calls.map(([image]) => image.id)).toEqual(["1", "0"]);
    expect(changed).toHaveBeenCalledOnce();
    expect(busy.mock.calls).toEqual([[true], [false]]);
    expect(screen.queryByText("Frontale")).not.toBeInTheDocument();
  });

  it("in caso di errore parziale mantiene disponibili le foto non associate", async () => {
    const changed = vi.fn(async () => undefined);
    vi.mocked(attachArchivedImage).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("Foto già associata"));
    render(<ImageArchive carId="car" onChanged={changed} />);
    fireEvent.click(await screen.findByLabelText("Seleziona Frontale"));
    fireEvent.click(screen.getByLabelText("Seleziona Interni"));
    vi.mocked(listArchivedImages).mockResolvedValue([images[1]]);
    fireEvent.click(screen.getByRole("button", { name: "Associa foto selezionate (2)" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Foto già associata");
    expect(screen.getByText("1 foto associate all’auto e rimosse dall’archivio.")).toBeInTheDocument();
    expect(screen.getByLabelText("Seleziona Interni")).not.toBeChecked();
    await waitFor(() => expect(changed).toHaveBeenCalledOnce());
  });

  it("apre il dettaglio con data di caricamento e data di scatto distinta", async () => {
    vi.mocked(listArchivedImages).mockResolvedValue([{ ...images[0], captured_at: "2024-03-15T11:30:00" }]);
    render(<ImageArchive />);
    fireEvent.click(await screen.findByRole("button", { name: "Apri foto: Frontale" }));
    expect(screen.getByRole("dialog", { name: "Dettagli foto" })).toBeInTheDocument();
    expect(screen.getByText("Data di caricamento")).toBeInTheDocument();
    expect(screen.getByText("Data di creazione / scatto")).toBeInTheDocument();
    expect(screen.getByText(/15\/03\/2024/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chiudi foto" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("non inventa una data di scatto se i metadati sono assenti", async () => {
    render(<ImageArchive />);
    fireEvent.click(await screen.findByRole("button", { name: "Apri foto: Frontale" }));
    expect(screen.getByText(/Non disponibile: la foto/)).toBeInTheDocument();
  });

  it("carica più foto dall’interfaccia e aggiorna l’archivio", async () => {
    vi.mocked(uploadArchivedImage).mockResolvedValue(undefined);
    render(<ImageArchive />);
    await screen.findByText("Frontale");
    const file = new File(["photo"], "foto.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Aggiungi foto all’archivio"), { target: { files: [file] } });
    expect(await screen.findByText("1 foto caricate nell’archivio.")).toBeInTheDocument();
    expect(uploadArchivedImage).toHaveBeenCalledWith(file);
  });
});
