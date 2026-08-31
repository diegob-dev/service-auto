import { Route, Routes } from "react-router-dom";
import {
  AboutPage,
  CarDetailPage,
  CarsPage,
  ContactPage,
  HomePage,
  NotFoundPage,
  ServicesPage,
  WorkshopPage,
} from "../pages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/officina" element={<WorkshopPage />} />
      <Route path="/servizi" element={<ServicesPage />} />
      <Route path="/auto-usate" element={<CarsPage />} />
      <Route path="/auto-usate/:carSlug" element={<CarDetailPage />} />
      <Route path="/chi-siamo" element={<AboutPage />} />
      <Route path="/contatti" element={<ContactPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
