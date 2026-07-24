export const BROKER_THRESHOLD_EUR = 5000;

export interface Broker {
  id: string;
  name: string;
  url: string;
  pitch: string;
  corridors: "all" | string[];
  // Introducer sub-tracking param (T37) — these programs don't confirm one
  // at signup; ask the account manager post-approval (afiliados-ejecucion.md §0).
  subIdParam?: string;
}

// TODO(human): replace with introducer/partner URLs once agreements are signed
export const BROKERS: Broker[] = [
  {
    id: "torfx",
    name: "TorFX",
    url: "https://www.torfx.com/",
    pitch: "Dedicated dealer for your transfer, no fees on large transfers, phone support.",
    corridors: "all",
  },
  {
    id: "currencies-direct",
    name: "Currencies Direct",
    // Referral link NOT wired here on purpose — it lives in the gitignored
    // referral-links.local.md ledger (repo is public). See afiliados-ejecucion.md §0.
    url: "https://www.currenciesdirect.com/",
    pitch: "Personal account manager, no transfer fees above the broker minimum.",
    corridors: "all",
  },
  {
    id: "ofx",
    name: "OFX",
    url: "https://www.ofx.com/",
    pitch: "24/7 phone service, dedicated dealer, no transfer fees.",
    corridors: "all",
  },
];

export type AmountBucket = "5k-10k" | "10k-50k" | "50k+";

export function amountBucket(amount: number): AmountBucket {
  if (amount < 10000) return "5k-10k";
  if (amount < 50000) return "10k-50k";
  return "50k+";
}
