import type { CarWithImages } from "../features/cars/types";
import { formatCarKilometers, formatCarPrice } from "./formatters";
import { COMPANY } from "./company";

export const pageMetadata: Record<string, { title: string; description: string }> = {
  "/privacy": { title: "Informativa privacy | SERVICE SRL", description: "Informazioni sul trattamento dei dati personali sul sito SERVICE SRL." },
  "/cookie": { title: "Informativa cookie | SERVICE SRL", description: "Cookie e archiviazione nel browser sul sito SERVICE SRL." },
  "/": {
    title: "SERVICE SRL | Officina Volvo e auto usate a Vigevano",
    description: "Officina specializzata Volvo e auto usate garantite a Vigevano: esperienza, trasparenza e assistenza professionale.",
  },
  "/officina": {
    title: "Officina specializzata Volvo a Vigevano | SERVICE SRL",
    description: "Scopri l'officina SERVICE SRL a Vigevano, specializzata nella manutenzione e riparazione di vetture Volvo.",
  },
  "/servizi": {
    title: "Tagliandi e servizi di officina a Vigevano | SERVICE SRL",
    description: "Diagnosi, tagliandi, elettronica, pneumatici e assistenza auto professionale a Vigevano.",
  },
  "/auto-usate": {
    title: "Auto usate garantite a Vigevano | SERVICE SRL",
    description: "Consulta le auto usate selezionate e garantite disponibili presso SERVICE SRL a Vigevano.",
  },
  "/chi-siamo": {
    title: "Chi siamo | SERVICE SRL",
    description: "Conosci SERVICE SRL, officina specializzata Volvo e punto di riferimento automotive a Vigevano.",
  },
  "/contatti": {
    title: "Contatti e orari | SERVICE SRL",
    description: `Contatta SERVICE SRL o raggiungi l'officina in ${COMPANY.street} a ${COMPANY.city}.`,
  },
  "/admin": {
    title: "Area amministrativa | SERVICE SRL",
    description: "Area riservata SERVICE SRL.",
  },
};

export function getCarMetadata(car: CarWithImages) {
  const name = [car.brand, car.model, car.version?.trim()].filter(Boolean).join(" ");
  const details = [car.year, car.kilometers == null ? null : formatCarKilometers(car.kilometers), car.fuel?.trim(), car.price == null ? null : formatCarPrice(car.price)].filter(Boolean).join(", ");
  return {
    title: `${name} usata${car.year ? ` ${car.year}` : ""} a Vigevano | SERVICE SRL`,
    description: `${name} usata a Vigevano${details ? `: ${details}` : ""}. Scopri foto e caratteristiche e contatta SERVICE SRL per la disponibilità.`,
  };
}

export function getCarStructuredData(car: CarWithImages, siteUrl: string, imageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: [car.brand, car.model, car.version?.trim()].filter(Boolean).join(" "),
    url: new URL(`/auto-usate/${car.slug}`, siteUrl).href,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(car.description?.trim() ? { description: car.description.trim() } : {}),
    ...(car.year ? { vehicleModelDate: String(car.year) } : {}),
    ...(car.kilometers == null ? {} : { mileageFromOdometer: { "@type": "QuantitativeValue", value: car.kilometers, unitCode: "KMT" } }),
    ...(car.fuel?.trim() ? { fuelType: car.fuel } : {}),
    ...(car.transmission?.trim() ? { vehicleTransmission: car.transmission } : {}),
    ...(car.price == null ? {} : { offers: { "@type": "Offer", price: car.price, priceCurrency: "EUR", itemCondition: "https://schema.org/UsedCondition", url: new URL(`/auto-usate/${car.slug}`, siteUrl).href, seller: { "@type": "AutoDealer", name: "SERVICE SRL", url: siteUrl } } }),
  };
}


