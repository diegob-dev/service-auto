type CarSlugSource = {
  brand: string;
  model: string;
  version?: string | null;
  year?: number | null;
};

export function buildCarSlug({ brand, model, version, year }: CarSlugSource) {
  const source = [brand, model, version, year]
    .filter((value) => value !== null && value !== undefined && String(value).trim())
    .join(" ");

  return source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "auto-usata";
}
