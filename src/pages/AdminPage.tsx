import { LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLogin } from "@/features/admin/components/AdminLogin";
import { AdminPasswordReset } from "@/features/admin/components/AdminPasswordReset";
import { CarEditor } from "@/features/admin/components/CarEditor";
import { CarsPanel } from "@/features/admin/components/CarsPanel";
import { UsersPanel } from "@/features/admin/components/UsersPanel";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";

export function AdminPage() {
  const admin = useAdminDashboard();

  if (admin.checkingAuth) {
    return <div className="mx-auto max-w-7xl px-4 py-10">Verifica sessione…</div>;
  }

  if (admin.recoveringPassword) {
    return (
      <AdminPasswordReset
        onSubmit={admin.resetPassword}
        busy={admin.busy}
        error={admin.error}
      />
    );
  }

  if (!admin.session) {
    return <AdminLogin onSubmit={admin.login} busy={admin.busy} error={admin.error} />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Area riservata</p>
          <h1 className="font-display text-4xl uppercase">Gestione parco auto</h1>
        </div>
        <Button variant="outline" onClick={admin.logout}><LogOut /> Esci</Button>
      </header>

      {admin.error && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
          {admin.error}
        </p>
      )}

      <div className="mb-6 flex gap-2">
        <Button variant={admin.tab === "cars" ? "default" : "outline"} onClick={admin.showCars}>
          Auto ({admin.cars.length})
        </Button>
        <Button variant={admin.tab === "users" ? "default" : "outline"} onClick={admin.showUsers}>
          <Users /> Utenti ({admin.users.length})
        </Button>
      </div>

      {admin.tab === "cars" ? (
        <CarsPanel
          cars={admin.cars}
          onCreate={admin.createCar}
          onEdit={admin.editCar}
          onDelete={admin.deleteCar}
        />
      ) : (
        <UsersPanel
          users={admin.users}
          busy={admin.busy}
          onCreate={admin.createUser}
          onRefresh={admin.refreshCurrent}
          onError={admin.setError}
        />
      )}

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
