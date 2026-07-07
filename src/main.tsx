import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./app/providers/QueryProviders.tsx";
import { AppLayout } from "./app/layouts/AppLayout/index.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AppLayout>
          <App />
        </AppLayout>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>,
);
