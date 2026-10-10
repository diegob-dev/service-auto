import { useState, type FormEvent } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminInputClass } from "../constants";

type AdminLoginProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRequestPasswordReset: (email: string) => Promise<void>;
  busy: boolean;
  error: string;
};

export function AdminLogin({ onSubmit, onRequestPasswordReset, busy, error }: AdminLoginProps) {
  const [recovering, setRecovering] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email"));
    setSending(true);
    setRecoveryError("");
    try {
      await onRequestPasswordReset(email);
      setSent(true);
    } catch (caught) {
      setRecoveryError(caught instanceof Error ? caught.message : "Invio non riuscito. Riprova più tardi.");
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md items-center px-4">
      <Card className="w-full shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="size-10 text-primary" />
            <CardTitle className="text-2xl">{recovering ? "Recupera password" : "Accesso amministratore"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recovering ? <form className="space-y-4" onSubmit={requestReset}>
            <p className="text-sm text-muted-foreground">Inserisci l’email associata al tuo account. Ti invieremo un link per scegliere una nuova password.</p>
            <label className="block text-sm font-semibold">Email dell’account
              <input className={`${adminInputClass} mt-1`} name="email" type="email" autoComplete="email" required disabled={sending || sent} />
            </label>
            <p className="text-xs text-muted-foreground">Se il tuo account ha solo uno username, contatta il titolare per associare un’email.</p>
            {recoveryError && <p role="alert" className="text-sm text-red-600">{recoveryError}</p>}
            {sent && <p role="status" className="text-sm text-primary-dark">Se l’indirizzo è associato a un account, riceverai un’email con il link. Controlla anche la cartella spam.</p>}
            <Button className="w-full" type="submit" disabled={sending || sent}>{sending ? "Invio…" : "Invia link di recupero"}</Button>
            <Button className="w-full" type="button" variant="outline" disabled={sending} onClick={() => { setRecovering(false); setSent(false); setRecoveryError(""); }}>Torna all’accesso</Button>
          </form> : <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm font-semibold">
              Username o email
              <input className={`${adminInputClass} mt-1`} name="email" type="text" autoComplete="username" required />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input className={`${adminInputClass} mt-1`} name="password" type="password" autoComplete="current-password" required autoFocus />
            </label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? "Accesso…" : "Accedi"}
            </Button>
            <Button className="w-full" type="button" variant="ghost" disabled={busy} onClick={() => setRecovering(true)}>Password dimenticata?</Button>
          </form>}
        </CardContent>
      </Card>
    </div>
  );
}
