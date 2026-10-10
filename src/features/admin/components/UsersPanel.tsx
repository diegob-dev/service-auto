import { useMemo, useState, type FormEvent } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as adminApi from "../api";
import { adminInputClass } from "../constants";
import type { AdminUser, StaffRole } from "../types";

type UsersPanelProps = {
  users: AdminUser[];
  currentUserId: string;
  busy: boolean;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
};

export function UsersPanel(props: UsersPanelProps) {
  const { users, currentUserId, busy, onCreate, onRefresh, onError } = props;
  const [pendingUser, setPendingUser] = useState<{ id: string; label: string } | null>(null);
  const orderedUsers = useMemo(
    () => [...users].sort((first, second) => {
      if (first.id === currentUserId) return -1;
      if (second.id === currentUserId) return 1;
      return first.email.localeCompare(second.email, "it", { sensitivity: "base" });
    }),
    [currentUserId, users],
  );

  async function toggle(user: AdminUser) {
    setPendingUser({ id: user.id, label: user.active ? "Disattivazione…" : "Riattivazione…" });
    try {
      await adminApi.saveUser({ id: user.id, email: user.email, active: !user.active, role: user.role });
      await onRefresh();
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Aggiornamento non riuscito");
    } finally {
      setPendingUser(null);
    }
  }

  async function changeRole(user: AdminUser, role: StaffRole) {
    setPendingUser({ id: user.id, label: "Aggiornamento ruolo…" });
    try {
      await adminApi.saveUser({ id: user.id, email: user.email, active: user.active, role });
      await onRefresh();
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Ruolo non aggiornato");
    } finally {
      setPendingUser(null);
    }
  }

  async function remove(user: AdminUser) {
    if (!window.confirm(`Eliminare definitivamente l’utente ${user.email}?`)) return;
    setPendingUser({ id: user.id, label: "Eliminazione…" });
    try {
      await adminApi.deleteUser(user.id);
      await onRefresh();
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Utente non eliminato");
    } finally {
      setPendingUser(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Card>
        <CardHeader><CardTitle>Nuovo utente</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onCreate}>
            <input className={adminInputClass} name="email" type="email" aria-label="Email" placeholder="Email" autoComplete="email" required />
            <p className="text-xs text-muted-foreground">Usa un’email reale: servirà per recuperare la password.</p>
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
          {orderedUsers.map((user) => (
            <div
              key={user.id}
              className={`relative flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
                user.id === currentUserId
                  ? "border-primary/40 bg-primary/8 shadow-sm"
                  : ""
              }`}
            >
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
                  disabled={busy || pendingUser !== null}
                  onChange={(event) => void changeRole(user, event.target.value as StaffRole)}
                >
                  <option value="seller">Venditore</option>
                  <option value="admin">Admin</option>
                </select>
                <Button variant="outline" disabled={busy || pendingUser !== null} onClick={() => void toggle(user)}>{user.active ? "Disattiva" : "Riattiva"}</Button>
                <Button variant="outline" disabled={busy || pendingUser !== null} className="text-red-600" onClick={() => void remove(user)}><Trash2 /> Elimina</Button>
              </div>
              {pendingUser?.id === user.id && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/80 backdrop-blur-[1px]"
                  role="status"
                >
                  <span className="flex items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-2 text-sm font-semibold text-primary-dark shadow-md">
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    {pendingUser.label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
