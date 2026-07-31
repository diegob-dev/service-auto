import { Route, Routes } from "react-router-dom";
import {
  CarDetailsPage,
  CarsPage,
  ContactPage,
  Homepage,
  InfoPage,
  NotFoundPage,
} from "./pages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route
        path="/officina"
        element={
          <InfoPage
            title="Officina"
            description="Manutenzione e riparazioni specializzate Volvo, con diagnosi computerizzata e ricambi certificati."
          />
        }
      />
      <Route
        path="/servizi"
        element={
          <InfoPage
            title="Servizi"
            description="Tagliandi, elettronica, pneumatici e climatizzazione: tutto ciò che serve alla tua auto."
          />
        }
      />
      <Route path="/auto-usate" element={<CarsPage />} />
      <Route path="/auto-usate/:carId" element={<CarDetailsPage />} />
      <Route
        path="/chi-siamo"
        element={
          <InfoPage
            title="Chi siamo"
            description="Esperienza, competenza e passione per Volvo e per le auto garantite."
          />
        }
      />
      <Route path="/contatti" element={<ContactPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
