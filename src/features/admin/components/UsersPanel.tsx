import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as adminApi from "../api";
import { adminInputClass } from "../constants";
import type { AdminUser } from "../types";

type UsersPanelProps = {
  users: AdminUser[];
  busy: boolean;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
};

export function UsersPanel(props: UsersPanelProps) {
  const { users, busy, onCreate, onRefresh, onError } = props;

  async function toggle(user: AdminUser) {
    try {
      await adminApi.saveUser({ id: user.id, email: user.email, active: !user.active });
      await onRefresh();
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Aggiornamento non riuscito");
    }
  }

  async function changePassword(user: AdminUser) {
    const password = window.prompt(`Nuova password per ${user.email} (minimo 12 caratteri)`);
    if (password === null) return;
    if (password.length < 12) {
      onError("La password deve contenere almeno 12 caratteri");
      return;
    }
    try {
      await adminApi.saveUser({ id: user.id, email: user.email, password, active: user.active });
      onError("");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Password non aggiornata");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Card>
        <CardHeader><CardTitle>Nuovo utente</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onCreate}>
            <input className={adminInputClass} name="email" type="email" placeholder="Email" required />
            <input className={adminInputClass} name="password" type="password" minLength={12} placeholder="Password (minimo 12 caratteri)" required />
            <Button type="submit" disabled={busy}>Aggiungi utente</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Utenti autorizzati</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div><strong>{user.email}</strong><p className="text-xs text-muted-foreground">{user.active ? "Attivo" : "Disattivato"}</p></div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => void changePassword(user)}>Cambia password</Button>
                <Button variant="outline" onClick={() => void toggle(user)}>{user.active ? "Disattiva" : "Riattiva"}</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
