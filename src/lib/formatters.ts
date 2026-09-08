export const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const numberFormatter = new Intl.NumberFormat("it-IT", {
  useGrouping: true,
});

export const formatCarPrice = (value: number | null | undefined) =>
  value == null ? "-" : currencyFormatter.format(value);

export const formatCarKilometers = (value: number | null | undefined) =>
  value == null ? "-" : `${numberFormatter.format(value)} km`;
