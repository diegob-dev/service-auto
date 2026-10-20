import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";

const output = path.resolve("dist");
const sitemap = new JSDOM(await readFile(path.join(output, "sitemap.xml"), "utf8"), { contentType: "text/xml" });
const urls = [...sitemap.window.document.querySelectorAll("loc")].map((element) => element.textContent);
assert.ok(urls.length >= 8);
assert.equal(new Set(urls).size, urls.length);
assert.ok(!urls.some((url) => new URL(url).pathname === "/admin"));
for (const url of urls) {
  const pathname = new URL(url).pathname;
  const file = path.join(output, pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`);
  const dom = new JSDOM(await readFile(file, "utf8"));
  const document = dom.window.document;
  assert.equal(document.querySelectorAll("title").length, 1, url);
  assert.equal(document.querySelectorAll('meta[name="description"]').length, 1, url);
  assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1, url);
  assert.equal(document.querySelector('link[rel="canonical"]').href, url);
  assert.equal(document.querySelector('meta[name="robots"]').content, "index, follow", url);
  assert.ok(document.querySelector("main h1"), `Heading mancante: ${url}`);
  assert.ok(!document.querySelector('[aria-label="Caricamento pagina"]'), url);
  for (const element of document.querySelectorAll('[src^="/"], [href^="/assets/"]')) {
    const assetPath = element.getAttribute("src") ?? element.getAttribute("href");
    assert.ok((await stat(path.join(output, assetPath.slice(1)))).isFile(), assetPath);
  }
  for (const element of document.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(element.textContent);
  const state = JSON.parse(document.getElementById("prerender-state").textContent);
  for (const query of state.queries) {
    for (const car of query.state.data) {
      assert.equal(car.status, "published");
      assert.ok(!Object.hasOwn(car, "license_plate"));
    }
  }
  if (pathname.startsWith("/auto-usate/")) {
    const car = JSON.parse(document.getElementById("car-structured-data").textContent);
    assert.equal(car["@type"], "Car");
    assert.equal(car.url, url);
    assert.equal(document.querySelector('meta[property="og:url"]').content, url);
    assert.ok(document.querySelector('meta[property="og:image"]')?.content);
  }
  dom.window.close();
}
const notFound = new JSDOM(await readFile(path.join(output, "404.html"), "utf8"));
assert.equal(notFound.window.document.querySelector('meta[name="robots"]').content, "noindex, nofollow");
assert.ok(notFound.window.document.querySelector("main h1"));
console.log(`SEO verificata: ${urls.length} URL con contenuti HTML, canonical, metadati e risorse validi.`);
sitemap.window.close();
notFound.window.close();
