import { useEffect, useState, type FormEvent } from "react";
import { LogOut, Pencil, Plus, Shield, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatter, numberFormatter } from "@/lib/formatters";
import type { CarRecord, CarStatus } from "@/features/cars/types";
import type { AdminUser, CarInput } from "@/features/admin/types";
import * as adminApi from "@/features/admin/api";

const TOKEN_KEY = "service-admin-session";
const inputClass = "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary";
const emptyCar: CarInput = {
  slug: "", brand: "", model: "", version: null, description: null,
  year: new Date().getFullYear(), kilometers: 0, price: 0, fuel: null,
  transmission: null, color: null, power_cv: null, status: "draft", featured: false,
};

export function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [cars, setCars] = useState<CarRecord[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tab, setTab] = useState<"cars" | "users">("cars");
  const [carForm, setCarForm] = useState<CarInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh(activeToken = token) {
    if (!activeToken) return;
    try {
      const [nextCars, nextUsers] = await Promise.all([
        adminApi.listCars(activeToken), adminApi.listUsers(activeToken),
      ]);
      setCars(nextCars); setUsers(nextUsers); setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sessione non valida");
      sessionStorage.removeItem(TOKEN_KEY); setToken(null);
    }
  }

  useEffect(() => { void refresh(); }, [token]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const nextToken = await adminApi.login(String(form.get("username")), String(form.get("password")));
      sessionStorage.setItem(TOKEN_KEY, nextToken); setToken(nextToken);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Accesso non riuscito"); }
    finally { setBusy(false); }
  }

  if (!token) return <Login onSubmit={handleLogin} busy={busy} error={error} />;
  const activeToken = token;

  async function handleSaveCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!carForm) return; setBusy(true); setError("");
    try { await adminApi.saveCar(activeToken, carForm); setCarForm(null); await refresh(activeToken); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Salvataggio non riuscito"); }
    finally { setBusy(false); }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Eliminare definitivamente questa auto?")) return;
    try { await adminApi.deleteCar(activeToken, id); await refresh(activeToken); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Eliminazione non riuscita"); }
  }

  async function handleUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await adminApi.saveUser(activeToken, {
        username: String(form.get("username")), password: String(form.get("password")), active: true,
      });
      event.currentTarget.reset(); await refresh(activeToken);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Utente non salvato"); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm font-bold uppercase text-primary">Area riservata</p><h1 className="font-display text-4xl uppercase">Gestione parco auto</h1></div>
        <Button variant="outline" onClick={() => { void adminApi.logout(activeToken); sessionStorage.removeItem(TOKEN_KEY); setToken(null); }}><LogOut /> Esci</Button>
      </header>
      {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      <div className="mb-6 flex gap-2">
        <Button variant={tab === "cars" ? "default" : "outline"} onClick={() => setTab("cars")}>Auto ({cars.length})</Button>
        <Button variant={tab === "users" ? "default" : "outline"} onClick={() => setTab("users")}><Users /> Utenti ({users.length})</Button>
      </div>
      {tab === "cars" ? (
        <>
          <div className="mb-5 flex justify-end"><Button onClick={() => setCarForm({ ...emptyCar })}><Plus /> Nuova auto</Button></div>
          <div className="grid gap-4 lg:grid-cols-2">
            {cars.map((car) => <Card key={car.id}><CardHeader><CardTitle>{car.brand} {car.model}</CardTitle></CardHeader><CardContent>
              <div className="mb-4 flex flex-wrap gap-2 text-sm text-muted-foreground"><span>{car.year}</span><span>·</span><span>{numberFormatter.format(car.kilometers)} km</span><span>·</span><strong className="text-foreground">{currencyFormatter.format(car.price)}</strong><span className="rounded bg-accent px-2 py-0.5">{car.status}</span>{car.featured && <span className="rounded bg-primary/15 px-2 py-0.5 text-primary-dark">In evidenza</span>}</div>
              <div className="flex gap-2"><Button variant="outline" onClick={() => setCarForm({ ...car })}><Pencil /> Modifica</Button><Button variant="outline" className="text-red-600" onClick={() => void handleDelete(car.id)}><Trash2 /> Elimina</Button></div>
            </CardContent></Card>)}
          </div>
          {carForm && <CarEditor value={carForm} onChange={setCarForm} onClose={() => setCarForm(null)} onSubmit={handleSaveCar} busy={busy} />}
        </>
      ) : <UsersPanel users={users} token={activeToken} onCreate={handleUser} onRefresh={() => refresh(activeToken)} busy={busy} setError={setError} />}
    </div>
  );
}

function Login({ onSubmit, busy, error }: { onSubmit: (e: FormEvent<HTMLFormElement>) => void; busy: boolean; error: string }) {
  return <div className="mx-auto flex min-h-[65vh] max-w-md items-center px-4"><Card className="w-full shadow-xl"><CardHeader><Shield className="mb-3 size-10 text-primary" /><CardTitle className="text-2xl">Accesso amministratore</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={onSubmit}><label className="block text-sm font-semibold">Username<input className={`${inputClass} mt-1`} name="username" defaultValue="user" autoComplete="username" required /></label><label className="block text-sm font-semibold">Password<input className={`${inputClass} mt-1`} name="password" type="password" autoComplete="current-password" autoFocus /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<Button className="w-full" type="submit" disabled={busy}>{busy ? "Accesso…" : "Accedi"}</Button><p className="text-xs text-muted-foreground">Credenziali iniziali: user / password vuota. Cambiale dopo il primo accesso.</p></form></CardContent></Card></div>;
}

function CarEditor({ value, onChange, onClose, onSubmit, busy }: { value: CarInput; onChange: (v: CarInput) => void; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; busy: boolean }) {
  const set = (key: keyof CarInput, next: unknown) => onChange({ ...value, [key]: next });
  const textFields: Array<[keyof CarInput, string]> = [["brand", "Marca"], ["model", "Modello"], ["version", "Versione"], ["slug", "Slug URL"], ["fuel", "Alimentazione"], ["transmission", "Cambio"], ["color", "Colore"]];
  return <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/55 p-4"><form onSubmit={onSubmit} className="mx-auto max-w-3xl rounded-xl bg-background p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="font-display text-3xl uppercase">{value.id ? "Modifica auto" : "Nuova auto"}</h2><Button type="button" variant="ghost" size="icon" onClick={onClose}><X /></Button></div><div className="grid gap-4 md:grid-cols-2">{textFields.map(([key, label]) => <label key={key} className="text-sm font-semibold">{label}<input className={`${inputClass} mt-1`} value={String(value[key] ?? "")} required={key === "brand" || key === "model" || key === "slug"} onChange={(e) => set(key, e.target.value || null)} /></label>)}{[["year", "Anno"], ["kilometers", "Chilometri"], ["price", "Prezzo"], ["power_cv", "Potenza CV"]].map(([key, label]) => <label key={key} className="text-sm font-semibold">{label}<input className={`${inputClass} mt-1`} type="number" min="0" value={String(value[key as keyof CarInput] ?? "")} onChange={(e) => set(key as keyof CarInput, e.target.value === "" ? null : Number(e.target.value))} /></label>)}<label className="text-sm font-semibold">Stato<select className={`${inputClass} mt-1`} value={value.status} onChange={(e) => set("status", e.target.value as CarStatus)}><option value="draft">Bozza</option><option value="published">Pubblicata</option><option value="sold">Venduta</option></select></label><label className="flex items-center gap-2 pt-7 font-semibold"><input type="checkbox" checked={value.featured} onChange={(e) => set("featured", e.target.checked)} /> In evidenza</label><label className="text-sm font-semibold md:col-span-2">Descrizione<textarea className={`${inputClass} mt-1 min-h-28`} value={value.description ?? ""} onChange={(e) => set("description", e.target.value || null)} /></label></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Annulla</Button><Button type="submit" disabled={busy}>{busy ? "Salvataggio…" : "Salva auto"}</Button></div></form></div>;
}

function UsersPanel({ users, token, onCreate, onRefresh, busy, setError }: { users: AdminUser[]; token: string; onCreate: (e: FormEvent<HTMLFormElement>) => void; onRefresh: () => Promise<void>; busy: boolean; setError: (v: string) => void }) {
  async function toggle(user: AdminUser) { try { await adminApi.saveUser(token, { id: user.id, username: user.username, active: !user.active }); await onRefresh(); } catch (e) { setError(e instanceof Error ? e.message : "Aggiornamento non riuscito"); } }
  return <div className="grid gap-6 lg:grid-cols-[1fr_2fr]"><Card><CardHeader><CardTitle>Nuovo utente</CardTitle></CardHeader><CardContent><form className="space-y-3" onSubmit={onCreate}><input className={inputClass} name="username" placeholder="Username" required /><input className={inputClass} name="password" type="password" placeholder="Password" /><Button type="submit" disabled={busy}>Aggiungi utente</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Utenti autorizzati</CardTitle></CardHeader><CardContent className="space-y-3">{users.map((user) => <div key={user.id} className="flex items-center justify-between rounded-lg border p-3"><div><strong>{user.username}</strong><p className="text-xs text-muted-foreground">{user.active ? "Attivo" : "Disattivato"}</p></div><Button variant="outline" onClick={() => void toggle(user)}>{user.active ? "Disattiva" : "Riattiva"}</Button></div>)}</CardContent></Card></div>;
}
