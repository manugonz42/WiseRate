// Editorial trust scores for the "most trusted" sort. Grounded in
// proveedores.md ("100% fiables"). Keyed by provider alias (the Wise
// comparisons alias where the provider appears there).
const TRUST: Record<string, number> = {
  wise: 0.98,
  "western-union": 0.95,
  westernunion: 0.95,
  moneygram: 0.93,
  remitly: 0.93,
  "world-remit": 0.92,
  worldremit: 0.92,
  ria: 0.9,
  xoom: 0.9,
  moneytrans: 0.9,
  transfergo: 0.88,
  instarem: 0.88,
  smallworld: 0.87,
  xe: 0.87,
  currencyfair: 0.85,
  ofx: 0.85,
  revolut: 0.86,
};

export const DEFAULT_TRUST = 0.75;

export const trustFor = (alias: string): number =>
  TRUST[alias] ?? DEFAULT_TRUST;
