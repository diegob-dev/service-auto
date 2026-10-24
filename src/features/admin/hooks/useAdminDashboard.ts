import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import type { CarWithImages } from "@/features/cars/types";
import { supabase } from "@/lib/supabase";
import * as adminApi from "../api";
import type { ArchivedImage } from "../imageArchive";
import { backfillMissingThumbnails } from "../thumbnailBackfill";
import { emptyCar } from "../constants";
import type { AdminUser, CarInput, StaffRole } from "../types";
import { clearPasswordRecoveryError, passwordRecoveryRedirect } from "@/lib/passwordRecoveryRedirect";

export type AdminTab = "cars" | "users";

const RECOVERY_ACCOUNT_KEY = "service:password-recovery-user";
function recoveryAccount(userId?: string | null) {
  try {
    if (userId === undefined) return sessionStorage.getItem(RECOVERY_ACCOUNT_KEY);
    if (userId) sessionStorage.setItem(RECOVERY_ACCOUNT_KEY, userId);
    else sessionStorage.removeItem(RECOVERY_ACCOUNT_KEY);
  } catch {
    // Il recupero resta utilizzabile anche se il browser blocca sessionStorage.
  }
  return null;
}

export function useAdminDashboard() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
  const recoveryInProgress = useRef(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [cars, setCars] = useState<CarWithImages[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [tab, setTab] = useState<AdminTab>("cars");
  const [carForm, setCarForm] = useState<CarInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() => {
    const query = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    return passwordRecoveryRedirect.invalid || query.has("error") || fragment.has("error") || query.has("error_code") || fragment.has("error_code")
      ? "Il link di recupero non è valido o è scaduto. Richiedi un nuovo link con Password dimenticata."
      : "";
  });

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
      if (recoveryInProgress.current) return;
      const profile = await adminApi.getCurrentAdmin();
      if (recoveryInProgress.current) return;
      if (!profile) {
        await adminApi.logout();
        setSession(null);
        setError("Account non autorizzato ad accedere all'area amministrativa");
        return;
      }
      setLoadingData(true);
      setSession(nextSession);
      setCurrentUser(profile);
      setTab("cars");
      setCheckingAuth(false);
      const loadedCars = await refresh(profile.role);
      if (loadedCars) backfillMissingThumbnails(loadedCars);
    } catch (caught) {
      setSession(null);
      setError(caught instanceof Error ? caught.message : "Verifica account non riuscita");
    } finally {
      setCheckingAuth(false);
      setLoadingData(false);
    }
  }, [refresh]);

  useEffect(() => {
    let mounted = true;
    // L'errore resta nel messaggio corrente, senza contaminare i tentativi successivi.
    clearPasswordRecoveryError();
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) {
        setError("Impossibile verificare l’accesso. Riprova tra qualche istante.");
        setCheckingAuth(false);
      } else if (data.session && (passwordRecoveryRedirect.active || recoveryInProgress.current || recoveryAccount() === data.session.user.id)) {
        recoveryInProgress.current = true;
        recoveryAccount(data.session.user.id);
        setSession(data.session);
        setRecoveringPassword(true);
        setError("");
        setCheckingAuth(false);
      } else if (data.session) void establishSession(data.session);
      else setCheckingAuth(false);
    }).catch(() => {
      if (!mounted) return;
      setError("Impossibile verificare l’accesso. Riprova tra qualche istante.");
      setCheckingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        passwordRecoveryRedirect.active = false;
        recoveryInProgress.current = false;
        recoveryAccount(null);
        setRecoveringPassword(false);
        setSession(null);
        setCurrentUser(null);
        setTab("cars");
      }
      if (event === "PASSWORD_RECOVERY" && nextSession) {
        clearPasswordRecoveryError();
        recoveryInProgress.current = true;
        recoveryAccount(nextSession.user.id);
        setSession(nextSession);
        setRecoveringPassword(true);
        setError("");
        setCheckingAuth(false);
      }
      if (event === "TOKEN_REFRESHED" && nextSession && !recoveryInProgress.current) {
        // Il rinnovo del token aggiorna solo la sessione: niente schermata di caricamento
        // né reset della scheda, così l'editor aperto non viene interrotto.
        setSession(nextSession);
        // Esegue le chiamate Auth fuori dal callback, che mantiene un lock interno.
        setTimeout(() => {
          if (!mounted) return;
          void adminApi.getCurrentAdmin().then((profile) => {
            if (!mounted || profile) return;
            setError("Account non più autorizzato ad accedere all'area amministrativa");
            void adminApi.logout();
          }).catch(() => {
            // Un errore di rete temporaneo non chiude la sessione: le policy RLS restano valide.
          });
        }, 0);
      }
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

  async function saveCar(event: FormEvent<HTMLFormElement>, archiveImages: ArchivedImage[] = []) {
    event.preventDefault();
    if (!carForm) return false;
    setBusy(true);
    setError("");
    try {
      const saved = await adminApi.saveCar(carForm, archiveImages);
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
      await refresh(currentUser?.role);
      await invalidateCars();
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await adminApi.saveUser({
        email: String(form.get("email")),
        password: String(form.get("password")),
        active: true,
        role: form.get("role") === "admin" ? "admin" : "seller",
      });
      formElement.reset();
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
      passwordRecoveryRedirect.active = false;
      recoveryInProgress.current = false;
      recoveryAccount(null);
      setRecoveringPassword(false);
      setSession(null);
      setCurrentUser(null);
      setTab("cars");
      setCars([]);
      setUsers([]);
      setLoadingData(false);
      setChangingPassword(false);
    }
  }

  async function resetPassword(password: string) {
    setBusy(true);
    setError("");
    try {
      await adminApi.updatePassword(password);
      await adminApi.logout();
      passwordRecoveryRedirect.active = false;
      recoveryInProgress.current = false;
      recoveryAccount(null);
      setRecoveringPassword(false);
      setSession(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Password non aggiornata");
    } finally {
      setBusy(false);
    }
  }

  async function changeOwnPassword(password: string) {
    setBusy(true);
    setError("");
    try {
      await adminApi.updatePassword(password);
      setChangingPassword(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Password non aggiornata");
    } finally {
      setBusy(false);
    }
  }

  return {
    session,
    checkingAuth,
    loadingData,
    recoveringPassword,
    changingPassword,
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
    changeOwnPassword,
    logout,
    saveCar,
    deleteCar,
    createUser,
    imagesChanged,
    refreshCurrent: async () => { await refresh(currentUser?.role); },
    showCars: () => setTab("cars"),
    showUsers: () => setTab("users"),
    showPasswordChange: () => {
      setError("");
      setChangingPassword(true);
    },
    closePasswordChange: () => {
      setError("");
      setChangingPassword(false);
    },
    createCar: () => setCarForm({ ...emptyCar }),
    editCar: (car: CarWithImages) => setCarForm({ ...car }),
    updateCarForm: setCarForm,
    closeCarEditor: () => setCarForm(null),
  };
}
