import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { setPageMetadata } from "@/lib/pageMetadata";
import { pageMetadata } from "@/lib/seo";

const HomePage = lazy(() => import("../pages/HomePage").then((module) => ({ default: module.HomePage })));
const WorkshopPage = lazy(() => import("../pages/WorkshopPage").then((module) => ({ default: module.WorkshopPage })));
const ServicesPage = lazy(() => import("../pages/ServicesPage").then((module) => ({ default: module.ServicesPage })));
const CarsPage = lazy(() => import("../pages/CarsPage").then((module) => ({ default: module.CarsPage })));
const CarDetailPage = lazy(() => import("../pages/CarDetailPage").then((module) => ({ default: module.CarDetailPage })));
const AboutPage = lazy(() => import("../pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import("../pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const PrivacyPage = lazy(() => import("../pages/PrivacyPage").then((module) => ({ default: module.PrivacyPage })));
const CookiePage = lazy(() => import("../pages/CookiePage").then((module) => ({ default: module.CookiePage })));
const AdminPage = lazy(() => import("../pages/AdminPage").then((module) => ({ default: module.AdminPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

function usePageMetadata() {
  const { pathname: routePath } = useLocation();
  const pathname = routePath.replace(/\/+$/, "") || "/";

  useEffect(() => {
    const metadata = pageMetadata[pathname] ?? {
          title: "Pagina non trovata | SERVICE SRL",
          description: "La pagina richiesta non è disponibile.",
        };

    // Le schede auto gestiscono i metadati dopo aver verificato la disponibilità.
    if (!pathname.startsWith("/auto-usate/")) {
      setPageMetadata(metadata.title, metadata.description, pathname !== "/admin" && pathname in pageMetadata, pathname);
    }
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
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookie" element={<CookiePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
