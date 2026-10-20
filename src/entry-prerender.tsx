/// <reference types="node" />
import { renderToPipeableStream, renderToString } from "react-dom/server";
import { Writable } from "node:stream";
import { StaticRouter } from "react-router-dom";
import { dehydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./app/App";
import { AppLayout } from "./app/layouts/AppLayout";
import { getPublishedCars, getCarImageUrl } from "./features/cars/api";
import type { CarWithImages } from "./features/cars/types";
import { pageMetadata, getCarMetadata, getCarStructuredData } from "./lib/seo";

export { pageMetadata, getCarMetadata, getCarStructuredData, getCarImageUrl };

export async function loadCars() {
  return getPublishedCars();
}

export async function renderPage(pathname: string, cars: CarWithImages[]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  // Un timestamp passato forza il browser a verificare subito il catalogo corrente.
  if (pathname === "/") {
    client.setQueryData(["cars", "published", "featured"], cars.filter((car) => car.featured).slice(0, 3), { updatedAt: 1 });
  } else if (pathname.startsWith("/auto-usate")) {
    client.setQueryData(["cars", "published"], cars, { updatedAt: 1 });
  }
  const tree = <StaticRouter location={pathname}>
    <QueryClientProvider client={client}>
      <AppLayout><App /></AppLayout>
    </QueryClientProvider>
  </StaticRouter>;
  // La prima passata risolve i moduli lazy; quella sincrona salva soltanto il contenuto completo.
  await new Promise<void>((resolve, reject) => {
    let renderError: unknown;
    const writer = new Writable({
      write(_chunk, _encoding, callback) { callback(); },
      final(callback) { resolve(); callback(); },
    });
    writer.on("error", reject);
    const stream = renderToPipeableStream(
      tree,
      {
        onAllReady() {
          clearTimeout(timeout);
          if (renderError) reject(renderError);
          else stream.pipe(writer);
        },
        onError(error) { renderError = error; },
        onShellError(error) { clearTimeout(timeout); reject(error); },
      },
    );
    const timeout = setTimeout(() => { stream.abort(); reject(new Error(`Rendering scaduto: ${pathname}`)); }, 30_000);
  });
  const html = renderToString(tree);
  const state = dehydrate(client);
  client.clear();
  return { html, state };
}
