import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./global.css";
import App from "./app/App";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./app/providers/QueryProvider";
import { AppLayout } from "./app/layouts/AppLayout";

const app = (
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AppLayout>
          <App />
        </AppLayout>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>
);

const root = document.getElementById("root")!;
if (root.dataset.prerendered === "true" && root.dataset.pathname === window.location.pathname) hydrateRoot(root, app);
else createRoot(root).render(app);
