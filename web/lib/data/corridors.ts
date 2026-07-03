// Corridor SEO landing page registry (docs/modules/corridors.md contract).
// Adding a corridor = one entry here; the page route, sitemap, and static
// params all derive from this array.

export interface CorridorFAQ {
  question: string;
  answer: string;
}

export interface Corridor {
  slug: string;
  from: string; // ISO 4217
  to: string; // ISO 4217
  fromLabel: string; // e.g. "Europe"
  toLabel: string; // e.g. "the Philippines"
  defaultAmount: number;
  title: string;
  metaDescription: string;
  intro: string[];
  faq: CorridorFAQ[];
}

export const CORRIDORS: Corridor[] = [
  {
    slug: "eur-to-php",
    from: "EUR",
    to: "PHP",
    fromLabel: "Europe",
    toLabel: "the Philippines",
    defaultAmount: 1000,
    title: "Send Money from Europe to the Philippines (EUR → PHP)",
    metaDescription:
      "Compare live EUR to PHP exchange rates and fees across Wise, Western Union, Remitly, and TransferGo. See who gets your money to the Philippines for the least.",
    intro: [
      "Sending euros to the Philippines usually means picking between the mid-market exchange rate (what banks trade at) and whatever markup a transfer provider adds on top. That markup, not the advertised fee, is where most senders lose money.",
      "Below is a live snapshot comparing what a €1,000 transfer actually delivers across the major providers serving this corridor, updated hourly from each provider's own pricing where available.",
    ],
    faq: [
      {
        question: "What's the cheapest way to send money from Europe to the Philippines?",
        answer:
          "The cheapest provider changes week to week as promotions rotate, which is why we refresh this snapshot hourly rather than naming a fixed winner. In general, providers that quote at or near the mid-market rate with a small transparent fee (Wise, TransferGo) beat providers that bake a markup into the exchange rate (Western Union). Compare the \"recipient gets\" column above, not the advertised fee — it accounts for both.",
      },
      {
        question: "How long does an EUR to PHP transfer take?",
        answer:
          "Bank transfers typically arrive within a few hours to one business day. Mobile wallet payouts to GCash or Maya are often near-instant once the sender's payment clears. Cash pickup is usually available within minutes of the transfer being funded. Exact timing depends on the provider, payment method, and time of day.",
      },
      {
        question: "What does the mid-market rate and markup actually mean?",
        answer:
          "The mid-market rate is the midpoint between global buy and sell prices for EUR/PHP — the rate banks use with each other, with no markup. Providers either quote close to this rate and charge a separate fee (transparent pricing), or quote a worse rate than mid-market and call the difference \"no fee\" (the markup is hidden in the rate). We show both the fee and the markup percentage for each provider so you can compare total cost either way.",
      },
      {
        question: "Cash pickup or bank deposit — which is better in the Philippines?",
        answer:
          "Bank deposit and mobile wallet (GCash, Maya) payouts are usually cheaper and faster, and don't require the recipient to travel. Cash pickup is useful when the recipient has no bank account or needs the money the same day from a physical location — Western Union has the widest cash pickup network in the Philippines, though usually at a worse rate.",
      },
      {
        question: "Does SulitSend charge anything to use this comparison?",
        answer:
          "No — SulitSend is free to use. Some providers pay us a referral commission if you sign up through our links, but you pay the same price either way; it never affects the rates or ranking shown here.",
      },
    ],
  },
];

export function getCorridor(slug: string): Corridor | undefined {
  return CORRIDORS.find((c) => c.slug === slug);
}
