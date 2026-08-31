export const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const numberFormatter = new Intl.NumberFormat("it-IT", {
  useGrouping: true,
});
