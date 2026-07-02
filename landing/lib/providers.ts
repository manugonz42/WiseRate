export const COMPARED_PROVIDERS = [
  "Wise",
  "Western Union",
  "MoneyGram",
  "Remitly",
  "WorldRemit",
  "Ria",
  "Xoom",
  "TransferGo",
  "Revolut",
  "Instarem",
];

export type ComparisonRow = {
  provider: string;
  rate: number;
  feeEur: number;
  arrival: "minutes" | "hours";
  recipientPhp: number;
  highlight?: "best";
};

// Illustrative example only, real numbers come from the live comparison at APP_URL.
export const SAMPLE_COMPARISON: ComparisonRow[] = [
  {
    provider: "Wise",
    rate: 65.42,
    feeEur: 3.9,
    arrival: "minutes",
    recipientPhp: 32412,
    highlight: "best",
  },
  {
    provider: "Western Union",
    rate: 64.05,
    feeEur: 0,
    arrival: "minutes",
    recipientPhp: 32025,
  },
  {
    provider: "WorldRemit",
    rate: 64.8,
    feeEur: 1.99,
    arrival: "hours",
    recipientPhp: 32286,
  },
  {
    provider: "Remitly",
    rate: 64.6,
    feeEur: 2.49,
    arrival: "minutes",
    recipientPhp: 32107,
  },
  {
    provider: "Ria",
    rate: 63.95,
    feeEur: 2.0,
    arrival: "hours",
    recipientPhp: 31885,
  },
];
