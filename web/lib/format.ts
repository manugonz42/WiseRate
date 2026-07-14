// Shared currency formatters — ₱ amounts render with thousands separators and
// no decimals; € with two decimals (docs/architecture/localization.md).
export const php = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export const eur = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});
