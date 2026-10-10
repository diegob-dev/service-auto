import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminLogin } from "./AdminLogin";

describe("recupero password dal login", () => {
  it("richiede l'email e mostra una conferma senza rivelare l'esistenza dell'account", async () => {
    const request = vi.fn(async () => undefined);
    render(<AdminLogin onSubmit={vi.fn()} onRequestPasswordReset={request} busy={false} error="" />);
    fireEvent.click(screen.getByRole("button", { name: "Password dimenticata?" }));
    const email = screen.getByLabelText("Email dell’account");
    fireEvent.change(email, { target: { value: "utente@example.com" } });
    fireEvent.submit(email.closest("form")!);
    expect(await screen.findByRole("status")).toHaveTextContent("Se l’indirizzo è associato a un account");
    expect(request).toHaveBeenCalledWith("utente@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Torna all’accesso" }));
    expect(screen.getByLabelText("Username o email")).toBeInTheDocument();
  });

  it("mostra un errore di invio e consente di riprovare", async () => {
    const request = vi.fn(async () => { throw new Error("Invio temporaneamente non disponibile"); });
    render(<AdminLogin onSubmit={vi.fn()} onRequestPasswordReset={request} busy={false} error="" />);
    fireEvent.click(screen.getByRole("button", { name: "Password dimenticata?" }));
    const email = screen.getByLabelText("Email dell’account");
    fireEvent.change(email, { target: { value: "utente@example.com" } });
    fireEvent.submit(email.closest("form")!);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Invio temporaneamente non disponibile"));
    expect(screen.getByRole("button", { name: "Invia link di recupero" })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
