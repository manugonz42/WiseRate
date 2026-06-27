// Display formatting. Number values use tabular figures in the UI layer.

const PHP = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const EUR = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export const formatPHP = (value: number): string => PHP.format(value);
export const formatEUR = (value: number): string => EUR.format(value);

/** "63.50" — bare mid-market rate, two decimals. */
export const formatRate = (rate: number): string => rate.toFixed(2);

/** "+0.52%" / "-0.31%" with explicit sign. */
export const formatDelta = (delta: number): string =>
  `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}%`;

/** Relative time like "just now", "2m ago", "3h ago". */
export const relativeTime = (timestamp: number, now = Date.now()): string => {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};
