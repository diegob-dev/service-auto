import { build } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const output = path.resolve("dist");
const serverOutput = path.resolve("node_modules/.tmp/seo-ssr");
await build({ build: { ssr: "src/entry-prerender.tsx", outDir: serverOutput, copyPublicDir: false, rollupOptions: { output: { entryFileNames: "entry.mjs" } } } });
const { loadCars, renderPage, pageMetadata, getCarMetadata, getCarStructuredData, getCarImageUrl } = await import(pathToFileURL(path.join(serverOutput, "entry.mjs")).href);
const template = await readFile(path.join(output, "index.html"), "utf8");
const origin = template.match(/<meta property="og:url" content="([^"]+)"/)?.[1]?.replace(/\/$/, "");
const indexable = template.includes('name="robots" content="index, follow"');
const escape = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
// Non pubblicare una sitemap incompleta se il catalogo non è raggiungibile.
const cars = await loadCars();
const pages = Object.entries(pageMetadata).filter(([route]) => route !== "/admin").map(([route, metadata]) => ({ route, metadata }));
const slugs = new Set();
for (const car of cars) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(car.slug) || slugs.has(car.slug)) throw new Error("Slug auto non valido o duplicato nel catalogo pubblico.");
  slugs.add(car.slug);
  pages.push({ route: `/auto-usate/${car.slug}`, metadata: getCarMetadata(car), car });
}
for (const { route, metadata, car } of pages) {
  const { html, state } = await renderPage(route, cars);
  const url = origin ? `${origin}${route}` : undefined;
  const cover = car?.car_images.find((image) => image.is_cover) ?? car?.car_images[0];
  const image = cover ? getCarImageUrl(cover.storage_path) : origin ? `${origin}/og-image.jpg` : undefined;
  let document = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(metadata.title)}</title>`)
    .replace(/<meta (?:name="(?:description|twitter:title|twitter:description|twitter:image)"|property="og:(?:title|description|url|image)")[^>]*>/g, "");
  const tags = [
    `<meta name="description" content="${escape(metadata.description)}">`,
    `<meta property="og:title" content="${escape(metadata.title)}">`,
    `<meta property="og:description" content="${escape(metadata.description)}">`,
    `<meta name="twitter:title" content="${escape(metadata.title)}">`,
    `<meta name="twitter:description" content="${escape(metadata.description)}">`,
    ...(url && indexable ? [`<link rel="canonical" href="${escape(url)}">`, `<meta property="og:url" content="${escape(url)}">`] : []),
    ...(image ? [`<meta property="og:image" content="${escape(image)}">`, `<meta name="twitter:image" content="${escape(image)}">`] : []),
    ...(car && origin ? [`<script id="car-structured-data" type="application/ld+json">${json(getCarStructuredData(car, origin, image))}</script>`] : []),
    `<script id="prerender-state" type="application/json">${json(state)}</script>`,
  ];
  document = document.replace("</head>", `${tags.join("\n")}\n</head>`).replace('<div id="root"></div>', `<div id="root" data-prerendered="true" data-pathname="${escape(route)}">${html}</div>`);
  // Cloudflare Pages serve /officina.html anche all'URL senza estensione /officina.
  const file = path.join(output, route === "/" ? "index.html" : `${route.slice(1)}.html`);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, document);
}
// Niente regole _redirects: su Cloudflare Pages una riscrittura verso un file .html
// diventa un redirect all'URL senza estensione (/200.html -> /200) e l'app mostrerebbe 404.
// /admin ha quindi una sua pagina statica; le auto pubblicate dopo l'ultima build e gli URL
// inesistenti ricevono 404.html, da cui l'app carica comunque la pagina giusta.
await writeFile(path.join(output, "admin.html"), template
  .replace(/<title>[^<]*<\/title>/, `<title>${escape(pageMetadata["/admin"].title)}</title>`)
  .replace('name="robots" content="index, follow"', 'name="robots" content="noindex, nofollow"'));
const notFound = await renderPage("/404", []);
await writeFile(path.join(output, "404.html"), template
  .replace(/<title>[^<]*<\/title>/, "<title>Pagina non trovata | SERVICE SRL</title>")
  .replace('name="robots" content="index, follow"', 'name="robots" content="noindex, nofollow"')
  .replace('<div id="root"></div>', `<div id="root">${notFound.html}</div>`));
if (origin && indexable) {
  const entries = pages.map(({ route, car }) => `  <url><loc>${escape(`${origin}${route}`)}</loc>${car && !Number.isNaN(Date.parse(car.updated_at)) ? `<lastmod>${new Date(car.updated_at).toISOString()}</lastmod>` : ""}</url>`);
  await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`);
}
console.log(`SEO: generate ${pages.length} pagine HTML, incluse ${cars.length} auto pubblicate.`);
