type CompanyInfo = {
  name: string;
  vatNumber: string;
  /** Sede legale. */
  address: string;
  /** Indirizzo dell'officina, mostrato nei contatti e nei dati strutturati per Google. */
  street: string;
  postalCode: string;
  city: string;
  province: string;
  workshopAddress: string;
  geo: { latitude: number; longitude: number };
  mapEmbedUrl: string;
  email: string;
  siteUrl: string;
  directionsUrl: string;
  reviewsUrl: string;
  /** Art. 2250 c.c.: da compilare dopo la verifica su visura, es. "PV 95585". */
  rea: string | null;
  /** Art. 2250 c.c.: da compilare con il dato confermato dal cliente, es. "€ 10.000 i.v.". */
  shareCapital: string | null;
};

const street = "Corso Giacomo Brodolini 32";
const postalCode = "27029";
const city = "Vigevano";
const province = "PV";
const mapsQuery = encodeURIComponent(`Service SRL ${street} ${city}`).replace(/%20/g, "+");

export const COMPANY: CompanyInfo = {
  name: "SERVICE SRL",
  vatNumber: "00173600180",
  address: "Corso Brodolini 32, 27029 Vigevano (PV)",
  street,
  postalCode,
  city,
  province,
  workshopAddress: `${street}, ${postalCode} ${city} (${province})`,
  geo: { latitude: 45.3080511, longitude: 8.8615698 },
  mapEmbedUrl: `https://www.google.com/maps?q=${mapsQuery}&output=embed`,
  email: "info@servicevigevano.it",
  siteUrl: "https://servicevigevano.store",
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`,
  reviewsUrl: "https://search.google.com/local/reviews?placeid=ChIJm9-h5DPjhkcRNgr_q7dlFqQ",
  rea: null,
  shareCapital: null,
};
