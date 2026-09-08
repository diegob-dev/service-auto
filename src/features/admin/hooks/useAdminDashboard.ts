import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import type { CarWithImages } from "@/features/cars/types";
import { supabase } from "@/lib/supabase";
import * as adminApi from "../api";
import { emptyCar } from "../constants";
import type { AdminUser, CarInput, StaffRole } from "../types";

export type AdminTab = "cars" | "users";

export function useAdminDashboard() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
  const [cars, setCars] = useState<CarWithImages[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [tab, setTab] = useState<AdminTab>("cars");
  const [carForm, setCarForm] = useState<CarInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (role?: StaffRole) => {
    try {
      const nextCars = await adminApi.listCars();
      const nextUsers = role === "admin" ? await adminApi.listUsers() : [];
      setCars(nextCars);
      setUsers(nextUsers);
      setError("");
      return nextCars;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Dati non disponibili");
    }
  }, []);

  const establishSession = useCallback(async (nextSession: Session) => {
    try {
      const profile = await adminApi.getCurrentAdmin();
      if (!profile) {
        await adminApi.logout();
        setSession(null);
        setError("Account non autorizzato ad accedere all'area amministrativa");
        return;
      }
      setSession(nextSession);
      setCurrentUser(profile);
      setTab("cars");
      await refresh(profile.role);
    } catch (caught) {
      setSession(null);
      setError(caught instanceof Error ? caught.message : "Verifica account non riuscita");
    } finally {
      setCheckingAuth(false);
    }
  }, [refresh]);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) void establishSession(data.session);
      else setCheckingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
        setCurrentUser(null);
        setTab("cars");
      }
      if (event === "PASSWORD_RECOVERY" && nextSession) {
        setSession(nextSession);
        setRecoveringPassword(true);
        setCheckingAuth(false);
      }
      if (event === "TOKEN_REFRESHED" && nextSession) void establishSession(nextSession);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [establishSession]);

  const invalidateCars = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
    [queryClient],
  );

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const nextSession = await adminApi.login(String(form.get("email")), String(form.get("password")));
      await establishSession(nextSession);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Accesso non riuscito");
    } finally {
      setBusy(false);
    }
  }

  async function saveCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!carForm) return false;
    setBusy(true);
    setError("");
    try {
      const saved = await adminApi.saveCar(carForm);
      setCarForm({ ...saved, car_images: carForm.car_images ?? [] });
      await refresh(currentUser?.role);
      await invalidateCars();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Salvataggio non riuscito");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function deleteCar(car: CarWithImages) {
    if (!window.confirm("Eliminare definitivamente questa auto?")) return;
    try {
      await adminApi.deleteCar(car);
      await refresh(currentUser?.role);
      await invalidateCars();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Eliminazione non riuscita");
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await adminApi.saveUser({
        email: String(form.get("email")),
        password: String(form.get("password")),
        active: true,
        role: form.get("role") === "admin" ? "admin" : "seller",
      });
      event.currentTarget.reset();
      await refresh(currentUser?.role);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Utente non salvato");
    } finally {
      setBusy(false);
    }
  }

  async function imagesChanged() {
    if (!carForm?.id) return;
    const nextCars = await refresh(currentUser?.role);
    const nextCar = nextCars?.find((car) => car.id === carForm.id);
    if (nextCar) setCarForm({ ...nextCar });
    await invalidateCars();
  }

  async function logout() {
    try {
      await adminApi.logout();
    } finally {
      setSession(null);
      setCurrentUser(null);
      setTab("cars");
      setCars([]);
      setUsers([]);
    }
  }

  async function resetPassword(password: string) {
    setBusy(true);
    setError("");
    try {
      await adminApi.updatePassword(password);
      await adminApi.logout();
      setRecoveringPassword(false);
      setSession(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Password non aggiornata");
    } finally {
      setBusy(false);
    }
  }

  return {
    session,
    checkingAuth,
    recoveringPassword,
    cars,
    users,
    currentUser,
    tab,
    carForm,
    busy,
    error,
    setError,
    login,
    resetPassword,
    logout,
    saveCar,
    deleteCar,
    createUser,
    imagesChanged,
    refreshCurrent: async () => { await refresh(currentUser?.role); },
    showCars: () => setTab("cars"),
    showUsers: () => setTab("users"),
    createCar: () => setCarForm({ ...emptyCar }),
    editCar: (car: CarWithImages) => setCarForm({ ...car }),
    updateCarForm: setCarForm,
    closeCarEditor: () => setCarForm(null),
  };
}
