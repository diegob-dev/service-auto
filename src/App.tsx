import { Route, Routes } from "react-router-dom";
import {
  AboutPage,
  CarDetailsPage,
  CarsPage,
  ContactPage,
  Homepage,
  NotFoundPage,
  ServicesPage,
  WorkshopPage,
} from "./pages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/officina" element={<WorkshopPage />} />
      <Route path="/servizi" element={<ServicesPage />} />
      <Route path="/auto-usate" element={<CarsPage />} />
      <Route path="/auto-usate/:carId" element={<CarDetailsPage />} />
      <Route path="/chi-siamo" element={<AboutPage />} />
      <Route path="/contatti" element={<ContactPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
