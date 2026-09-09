import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const HomePage = lazy(() => import("../pages/HomePage").then((module) => ({ default: module.HomePage })));
const WorkshopPage = lazy(() => import("../pages/WorkshopPage").then((module) => ({ default: module.WorkshopPage })));
const ServicesPage = lazy(() => import("../pages/ServicesPage").then((module) => ({ default: module.ServicesPage })));
const CarsPage = lazy(() => import("../pages/CarsPage").then((module) => ({ default: module.CarsPage })));
const CarDetailPage = lazy(() => import("../pages/CarDetailPage").then((module) => ({ default: module.CarDetailPage })));
const AboutPage = lazy(() => import("../pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import("../pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const AdminPage = lazy(() => import("../pages/AdminPage").then((module) => ({ default: module.AdminPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

const pageMetadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Service SRL | Officina Volvo e auto usate a Vigevano",
    description: "Officina specializzata Volvo e auto usate garantite a Vigevano: esperienza, trasparenza e assistenza professionale.",
  },
  "/officina": {
    title: "Officina specializzata Volvo | Service SRL",
    description: "Scopri l'officina Service SRL a Vigevano, specializzata nella manutenzione e riparazione di vetture Volvo.",
  },
  "/servizi": {
    title: "Servizi di officina | Service SRL",
    description: "Diagnosi, tagliandi, elettronica, pneumatici e assistenza auto professionale a Vigevano.",
  },
  "/auto-usate": {
    title: "Auto usate garantite | Service SRL",
    description: "Consulta le auto usate selezionate e garantite disponibili presso Service SRL a Vigevano.",
  },
  "/chi-siamo": {
    title: "Chi siamo | Service SRL",
    description: "Conosci Service SRL, officina specializzata Volvo e punto di riferimento automotive a Vigevano.",
  },
  "/contatti": {
    title: "Contatti e orari | Service SRL",
    description: "Contatta Service SRL o raggiungi l'officina in Corso Giacomo Brodolini 32 a Vigevano.",
  },
  "/admin": {
    title: "Area amministrativa | Service SRL",
    description: "Area riservata Service SRL.",
  },
};

function usePageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = pathname.startsWith("/auto-usate/")
      ? {
          title: "Dettaglio auto usata | Service SRL",
          description: "Dettagli, caratteristiche e fotografie dell'auto usata selezionata presso Service SRL.",
        }
      : pageMetadata[pathname] ?? {
          title: "Pagina non trovata | Service SRL",
          description: "La pagina richiesta non è disponibile.",
        };

    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", metadata.description);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
}

function PageLoading() {
  return (
    <div role="status" aria-label="Caricamento pagina" className="mx-auto min-h-[55vh] w-full max-w-7xl animate-pulse px-4 py-12 sm:px-6">
      <span className="sr-only">Caricamento pagina in corso…</span>
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="mt-5 h-12 max-w-xl rounded bg-muted" />
      <div className="mt-8 h-72 rounded-2xl bg-muted" />
    </div>
  );
}

function App() {
  usePageMetadata();

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/officina" element={<WorkshopPage />} />
        <Route path="/servizi" element={<ServicesPage />} />
        <Route path="/auto-usate" element={<CarsPage />} />
        <Route path="/auto-usate/:carSlug" element={<CarDetailPage />} />
        <Route path="/chi-siamo" element={<AboutPage />} />
        <Route path="/contatti" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
