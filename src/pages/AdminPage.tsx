import { KeyRound, LoaderCircle, LogOut, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLogin } from "@/features/admin/components/AdminLogin";
import { AdminPasswordReset } from "@/features/admin/components/AdminPasswordReset";
import { CarEditor } from "@/features/admin/components/CarEditor";
import { CarsPanel } from "@/features/admin/components/CarsPanel";
import { UsersPanel } from "@/features/admin/components/UsersPanel";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import { requestPasswordReset } from "@/features/admin/api";

function AdminAccessLoading() {
  return (
    <div
      role="status"
      aria-label="Verifica accesso amministrativo"
      className="flex min-h-[65vh] items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
          <ShieldCheck className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-3xl uppercase">Accesso area riservata</h1>
        <p className="mt-2 text-muted-foreground">
          Stiamo verificando la sessione e i permessi del tuo account.
        </p>
        <LoaderCircle className="mx-auto mt-6 size-7 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Verifica sessione in corso…</span>
      </div>
    </div>
  );
}

function AdminDataLoading() {
  return (
    <div
      role="status"
      aria-label="Caricamento dati amministrativi"
      className="mx-auto w-full max-w-7xl animate-pulse px-4 py-10"
    >
      <span className="sr-only">Caricamento dati amministrativi…</span>
      <div className="h-4 w-28 rounded bg-muted" />
      <div className="mt-3 h-10 w-72 max-w-full rounded bg-muted" />
      <div className="mt-8 flex gap-2">
        <div className="h-10 w-28 rounded-lg bg-muted" />
        <div className="h-10 w-28 rounded-lg bg-muted" />
      </div>
      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="h-6 w-36 rounded bg-muted" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-16 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
      <div className="mt-5 h-48 rounded-xl border bg-card" />
    </div>
  );
}

export function AdminPage() {
  const admin = useAdminDashboard();
  const isAdmin = admin.currentUser?.role === "admin";

  if (admin.checkingAuth) {
    return <AdminAccessLoading />;
  }

  if (admin.recoveringPassword) {
    return (
      <AdminPasswordReset
        onSubmit={admin.resetPassword}
        onCancel={() => void admin.logout()}
        busy={admin.busy}
        error={admin.error}
      />
    );
  }

  if (!admin.session) {
    return (
      <AdminLogin
        onSubmit={admin.login}
        onRequestPasswordReset={requestPasswordReset}
        busy={admin.busy}
        error={admin.error}
      />
    );
  }

  if (admin.loadingData) return <AdminDataLoading />;

  if (admin.changingPassword) {
    return (
      <AdminPasswordReset
        onSubmit={admin.changeOwnPassword}
        onCancel={admin.closePasswordChange}
        busy={admin.busy}
        error={admin.error}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-primary">
            Area riservata
          </p>
          <h1 className="font-display text-4xl uppercase">
            Gestione parco auto
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accesso come {isAdmin ? "Admin" : "Venditore"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={admin.showPasswordChange}>
            <KeyRound /> Cambia password
          </Button>
          <Button variant="outline" onClick={admin.logout}>
            <LogOut /> Esci
          </Button>
        </div>
      </header>

      {admin.error && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
          {admin.error}
        </p>
      )}

      {isAdmin && (
        <div className="mb-6 flex gap-2">
          <>
            <Button
              variant={admin.tab === "cars" ? "default" : "outline"}
              onClick={admin.showCars}
            >
              Auto ({admin.cars.length})
            </Button>
            <Button
              variant={admin.tab === "users" ? "default" : "outline"}
              onClick={admin.showUsers}
            >
              <Users /> Utenti ({admin.users.length})
            </Button>
          </>
        </div>
      )}

      {admin.tab === "cars" ? (
        <CarsPanel
          cars={admin.cars}
          onCreate={admin.createCar}
          onEdit={admin.editCar}
          onDelete={admin.deleteCar}
        />
      ) : isAdmin ? (
        <UsersPanel
          users={admin.users}
          currentUserId={admin.currentUser?.id ?? ""}
          busy={admin.busy}
          onCreate={admin.createUser}
          onRefresh={admin.refreshCurrent}
          onError={admin.setError}
        />
      ) : null}

      {admin.carForm && (
        <CarEditor
          value={admin.carForm}
          busy={admin.busy}
          onChange={admin.updateCarForm}
          onClose={admin.closeCarEditor}
          onSubmit={admin.saveCar}
          onImagesChanged={admin.imagesChanged}
        />
      )}
    </div>
  );
}
