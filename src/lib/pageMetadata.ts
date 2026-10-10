export function setPageMetadata(title: string, description: string, indexable = true, pathname = window.location.pathname) {
  document.title = title;
  function meta(selector: string, attributes: Record<string, string>, content: string) {
    let element = document.querySelector<HTMLMetaElement>(selector);
    if (!element) {
      element = document.createElement("meta");
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
      document.head.append(element);
    }
    element.content = content;
  }
  meta('meta[name="description"]', { name: "description" }, description);
  meta('meta[property="og:title"]', { property: "og:title" }, title);
  meta('meta[property="og:description"]', { property: "og:description" }, description);
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();
  const canIndex = Boolean(configuredUrl) && indexable && import.meta.env.VITE_SITE_INDEXABLE !== "false";
  meta('meta[name="robots"]', { name: "robots" }, canIndex ? "index, follow" : "noindex, nofollow");
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (configuredUrl && canIndex) {
    const url = new URL(pathname, configuredUrl).href;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = url;
    meta('meta[property="og:url"]', { property: "og:url" }, url);
  } else {
    canonical?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
  }
}
