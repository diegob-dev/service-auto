import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminInputClass } from "../constants";

type AdminPasswordResetProps = {
  onSubmit: (password: string) => Promise<void>;
  busy: boolean;
  error: string;
};

export function AdminPasswordReset({ onSubmit, busy, error }: AdminPasswordResetProps) {
  const [localError, setLocalError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("passwordConfirmation"));

    if (password !== confirmation) {
      setLocalError("Le password non coincidono");
      return;
    }

    setLocalError("");
    await onSubmit(password);
  }

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md items-center px-4">
      <Card className="w-full shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <KeyRound className="size-10 text-primary" />
            <CardTitle className="text-2xl">Scegli una nuova password</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <label className="block text-sm font-semibold">
              Nuova password
              <input
                className={`${adminInputClass} mt-1`}
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                autoFocus
              />
            </label>
            <label className="block text-sm font-semibold">
              Conferma password
              <input
                className={`${adminInputClass} mt-1`}
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            {(localError || error) && (
              <p role="alert" className="text-sm text-red-600">{localError || error}</p>
            )}
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? "Aggiornamento…" : "Aggiorna password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
