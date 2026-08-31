import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./app/App";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./app/providers/QueryProvider";
import { AppLayout } from "./app/layouts/AppLayout";

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
