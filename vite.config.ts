import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { readFileSync } from "node:fs";
import { COMPANY } from "./src/lib/company.ts";
import { PHONE_NUMBER } from "./src/lib/constants.ts";

function productionMetadata(siteUrl: string, indexable: boolean): Plugin {
  const parsedUrl = siteUrl ? new URL(siteUrl) : null;
  const origin = parsedUrl?.origin ?? "";
  if (parsedUrl && (parsedUrl.protocol !== "https:" || parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash || parsedUrl.username || parsedUrl.password)) {
    throw new Error("VITE_SITE_URL deve essere il dominio HTTPS definitivo, senza percorsi o parametri.");
  }
  return {
    name: "production-metadata",
    transformIndexHtml() {
      return [
        { tag: "meta", attrs: { name: "robots", content: origin && indexable ? "index, follow" : "noindex, nofollow" }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:type", content: "website" }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:locale", content: "it_IT" }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:site_name", content: "SERVICE SRL" }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:title", content: "SERVICE SRL | Officina Volvo e auto usate a Vigevano" }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:description", content: "Officina specializzata Volvo e auto usate a Vigevano." }, injectTo: "head" },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" }, injectTo: "head" },
        ...(origin ? [
          { tag: "meta", attrs: { property: "og:url", content: origin + "/" }, injectTo: "head" as const },
          { tag: "meta", attrs: { property: "og:image", content: origin + "/og-image.jpg" }, injectTo: "head" as const },
          { tag: "script", attrs: { type: "application/ld+json" }, children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["AutoRepair", "AutoDealer"],
            name: COMPANY.name,
            url: origin,
            telephone: `+39${PHONE_NUMBER.replace(/\s/g, "")}`,
            email: COMPANY.email,
            vatID: `IT${COMPANY.vatNumber}`,
            address: { "@type": "PostalAddress", streetAddress: "Corso Brodolini 32", addressLocality: "Vigevano", addressRegion: "PV", postalCode: "27029", addressCountry: "IT" },
          }).replace(/</g, "\\u003c"), injectTo: "head" as const },
        ] : []),
      ];
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "og-image.jpg", source: readFileSync(path.resolve(__dirname, "src/assets/service-image.jpg")) });
      const routes = ["/", "/officina", "/servizi", "/auto-usate", "/chi-siamo", "/contatti", "/privacy", "/cookie"];
      const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
      this.emitFile({ type: "asset", fileName: "robots.txt", source: origin && indexable
        ? `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${origin}/sitemap.xml\n`
        : "User-agent: *\nDisallow: /\n" });
      if (origin && indexable) this.emitFile({ type: "asset", fileName: "sitemap.xml", source:
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${escapeXml(origin + route)}</loc></url>`).join("\n")}\n</urlset>\n` });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (mode === "production" && (!env.VITE_SUPABASE_URL?.trim() || !env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim())) {
    throw new Error("Configurare VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY nell'ambiente di build prima di pubblicare.");
  }
  const cloudflareBranch = process.env.CF_PAGES_BRANCH;
  const indexable = mode === "production" && env.VITE_SITE_INDEXABLE !== "false"
    && (!cloudflareBranch || ["front-end", "frontend"].includes(cloudflareBranch));
  return {
    plugins: [react(), tailwindcss(), productionMetadata(env.VITE_SITE_URL?.trim() ?? "", indexable)],
    define: { "import.meta.env.VITE_SITE_INDEXABLE": JSON.stringify(indexable ? "true" : "false") },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
