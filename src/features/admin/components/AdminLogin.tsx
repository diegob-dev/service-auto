import type { FormEvent } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminInputClass } from "../constants";

type AdminLoginProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  error: string;
};

export function AdminLogin({ onSubmit, busy, error }: AdminLoginProps) {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md items-center px-4">
      <Card className="w-full shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="size-10 text-primary" />
            <CardTitle className="text-2xl">Accesso amministratore</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm font-semibold">
              Email
              <input className={`${adminInputClass} mt-1`} name="email" type="email" autoComplete="username" required />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input className={`${adminInputClass} mt-1`} name="password" type="password" autoComplete="current-password" required autoFocus />
            </label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? "Accesso…" : "Accedi"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
