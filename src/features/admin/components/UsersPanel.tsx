import type { FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as adminApi from "../api";
import { adminInputClass } from "../constants";
import type { AdminUser, StaffRole } from "../types";

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
      await adminApi.saveUser({ id: user.id, email: user.email, active: !user.active, role: user.role });
      await onRefresh();
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Aggiornamento non riuscito");
    }
  }

  async function changePassword(user: AdminUser) {
    const password = window.prompt(`Nuova password per ${user.email}`);
    if (password === null) return;
    try {
      await adminApi.saveUser({ id: user.id, email: user.email, password, active: user.active, role: user.role });
      onError("");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Password non aggiornata");
    }
  }

  async function changeRole(user: AdminUser, role: StaffRole) {
    try {
      await adminApi.saveUser({ id: user.id, email: user.email, active: user.active, role });
      await onRefresh();
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Ruolo non aggiornato");
    }
  }

  async function remove(user: AdminUser) {
    if (!window.confirm(`Eliminare definitivamente l’utente ${user.email}?`)) return;
    try {
      await adminApi.deleteUser(user.id);
      await onRefresh();
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Utente non eliminato");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Card>
        <CardHeader><CardTitle>Nuovo utente</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onCreate}>
            <input className={adminInputClass} name="email" type="text" aria-label="Username o email" placeholder="Username o email" autoComplete="username" required />
            <input className={adminInputClass} name="password" type="password" aria-label="Password" placeholder="Password" autoComplete="new-password" required />
            <label className="block text-sm font-semibold">
              Ruolo
              <select className={`${adminInputClass} mt-1`} name="role" defaultValue="seller">
                <option value="seller">Venditore — gestisce le auto</option>
                <option value="admin">Admin — gestisce auto e utenti</option>
              </select>
            </label>
            <Button type="submit" disabled={busy}>Aggiungi utente</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Utenti autorizzati</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <strong>{user.email}</strong>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-bold ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                    {user.role === "admin" ? "Admin" : "Venditore"}
                  </span>
                  <span className="text-muted-foreground">{user.active ? "Attivo" : "Disattivato"}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className={`${adminInputClass} w-auto py-1.5 text-sm`}
                  aria-label={`Ruolo di ${user.email}`}
                  value={user.role}
                  onChange={(event) => void changeRole(user, event.target.value as StaffRole)}
                >
                  <option value="seller">Venditore</option>
                  <option value="admin">Admin</option>
                </select>
                <Button variant="outline" onClick={() => void changePassword(user)}>Cambia password</Button>
                <Button variant="outline" onClick={() => void toggle(user)}>{user.active ? "Disattiva" : "Riattiva"}</Button>
                <Button variant="outline" className="text-red-600" onClick={() => void remove(user)}><Trash2 /> Elimina</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
