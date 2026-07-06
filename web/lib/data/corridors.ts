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
  hasCompareCTA: boolean;
}

export const CORRIDORS: Corridor[] = [
  {
    slug: "eur-to-php",
    from: "EUR",
    to: "PHP",
    fromLabel: "Europe",
    toLabel: "the Philippines",
    defaultAmount: 1000,
    hasCompareCTA: true,
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
  {
    slug: "gbp-to-php",
    from: "GBP",
    to: "PHP",
    fromLabel: "the United Kingdom",
    toLabel: "the Philippines",
    defaultAmount: 1000,
    hasCompareCTA: false,
    title: "Send Money from the UK to the Philippines (GBP → PHP)",
    metaDescription:
      "Compare live GBP to PHP exchange rates and fees for sending money from the UK to the Philippines. See what Wise, Western Union, Remitly, and others actually deliver.",
    intro: [
      "The UK is home to one of the largest Filipino communities in Europe, with a large share working in the NHS and social care. For a household sending money home every week or month, the exchange rate margin — not the advertised fee — is what determines the real cost over a year.",
      "This snapshot compares what a £1,000 transfer delivers in PHP across UK high-street banks, specialist remittance firms, and fintech apps, refreshed hourly from each provider's own pricing.",
    ],
    faq: [
      {
        question: "What's the cheapest way to send money from the UK to the Philippines?",
        answer:
          "It shifts week to week as providers run promotions, which is why we refresh this table hourly instead of naming a fixed winner. As a rule, fintech apps that quote near the mid-market rate with a small stated fee (Wise, Instarem) tend to beat banks and cash-focused networks that fold their margin into the exchange rate. Compare the \"recipient gets\" column, not the headline fee — it's the only number that accounts for both.",
      },
      {
        question: "How long does a GBP to PHP transfer take?",
        answer:
          "Bank deposits usually land within a few hours to one business day. GCash and Maya wallet payouts are often near-instant once the sender's payment clears. Cash pickup at a partner branch is typically available within minutes of funding. Weekend and bank-holiday transfers can add a day on the sending side.",
      },
      {
        question: "Do UK banks charge more than transfer apps for sending to the Philippines?",
        answer:
          "Usually, yes. High-street banks like Barclays, HSBC, and Nationwide often advertise \"no fee\" international transfers, but the exchange rate they quote is typically 3-6% worse than mid-market — a hidden cost that dwarfs the flat fee a transparent app would charge. Always check the rate against the mid-market rate shown above, not just whether a fee is charged.",
      },
      {
        question: "Can I send GBP straight to a GCash or Maya wallet from the UK?",
        answer:
          "Yes — most of the specialist and fintech providers in this comparison support direct payout to GCash and Maya alongside traditional bank deposit and cash pickup, and wallet payouts are usually the fastest option available.",
      },
      {
        question: "Does SulitSend charge anything to use this comparison?",
        answer:
          "No — SulitSend is free to use. Some providers pay us a referral commission if you sign up through our links, but you pay the same price either way; it never affects the rates or ranking shown here.",
      },
    ],
  },
  {
    slug: "usd-to-php",
    from: "USD",
    to: "PHP",
    fromLabel: "the United States",
    toLabel: "the Philippines",
    defaultAmount: 1000,
    hasCompareCTA: false,
    title: "Send Money from the US to the Philippines (USD → PHP)",
    metaDescription:
      "Compare live USD to PHP exchange rates and fees for sending money from the US to the Philippines across Xoom, Wise, Remitly, and other major providers.",
    intro: [
      "The US-to-Philippines corridor is one of the largest remittance flows in the world by dollar volume, driven by a Filipino-American population of several million and a steady stream of workers on US employment visas sending money to family back home.",
      "Below is a live snapshot of what a $1,000 transfer actually delivers across major providers serving this corridor, updated hourly from each provider's own published pricing.",
    ],
    faq: [
      {
        question: "What's the cheapest way to send money from the US to the Philippines?",
        answer:
          "There's no single fixed winner — pricing shifts as providers run promotions, which is why this table refreshes hourly rather than naming one \"best\" option. Xoom (owned by PayPal) is the most recognized name in the Filipino-American community, but recognition and lowest cost aren't the same thing; compare the \"recipient gets\" column above against Wise, Remitly, and the others before assuming the familiar option is cheapest.",
      },
      {
        question: "How long does a USD to PHP transfer take?",
        answer:
          "Bank deposits typically arrive within a few hours to one business day. GCash and Maya wallet payouts are often near-instant once payment clears on the sending side. Cash pickup is usually available within minutes of the transfer being funded, subject to the receiving branch's hours.",
      },
      {
        question: "Is a bank wire from a US bank a good way to send money to the Philippines?",
        answer:
          "Usually not the cheapest. A wire from Bank of America, Wells Fargo, or a similar bank often adds a flat wire fee on top of an exchange rate with a wider margin than a dedicated remittance app, and correspondent banks along the way can deduct additional fees before the money arrives — making the final amount received harder to predict than a fixed-rate app transfer.",
      },
      {
        question: "Do I need to report money I send to family in the Philippines?",
        answer:
          "For most people, no special reporting is needed to send remittances — the IRS gift tax rules only come into play well above typical remittance amounts (the annual per-recipient exclusion is in the tens of thousands of dollars), and personal support payments to family are generally not treated as taxable gifts. This isn't tax advice; check with a tax professional if you're sending unusually large amounts.",
      },
      {
        question: "Does SulitSend charge anything to use this comparison?",
        answer:
          "No — SulitSend is free to use. Some providers pay us a referral commission if you sign up through our links, but you pay the same price either way; it never affects the rates or ranking shown here.",
      },
    ],
  },
  {
    slug: "cad-to-php",
    from: "CAD",
    to: "PHP",
    fromLabel: "Canada",
    toLabel: "the Philippines",
    defaultAmount: 1000,
    hasCompareCTA: false,
    title: "Send Money from Canada to the Philippines (CAD → PHP)",
    metaDescription:
      "Compare live CAD to PHP exchange rates and fees for sending money from Canada to the Philippines across Wise, Western Union, OFX, and other providers.",
    intro: [
      "Canada's Filipino community has grown quickly over the past decade, concentrated in Ontario, British Columbia, and Alberta, with many arriving through caregiver and healthcare worker pathways. Regular transfers home make the exchange rate margin the biggest lever on total cost, more than any flat fee.",
      "This snapshot compares what a CA$1,000 transfer delivers in PHP across the providers actively serving this corridor, refreshed hourly from live pricing.",
    ],
    faq: [
      {
        question: "What's the cheapest way to send money from Canada to the Philippines?",
        answer:
          "It varies week to week, which is why we refresh this snapshot hourly instead of naming a fixed winner. Providers quoting close to the mid-market rate with a small transparent fee (Wise, Instarem, OFX) generally beat providers that build their margin into the exchange rate. Compare the \"recipient gets\" column above, since it's the only figure that reflects both the rate and the fee together.",
      },
      {
        question: "How long does a CAD to PHP transfer take?",
        answer:
          "Bank deposits usually arrive within a few hours to one business day. GCash and Maya wallet transfers are often near-instant once the sender's payment clears. Cash pickup is typically available within minutes of funding, depending on the receiving branch's hours.",
      },
      {
        question: "Why don't RBC, TD, or Scotiabank show up in this comparison?",
        answer:
          "Canada's major banks don't publish the kind of live, comparable pricing feed this table relies on, so they're left out rather than shown with stale or estimated numbers. In practice, an international wire from a big-five Canadian bank tends to carry a wider exchange rate margin and a flat wire fee on top — it's worth calling your bank to compare directly against the live quotes above before assuming it's competitive.",
      },
      {
        question: "Can I send CAD straight to a GCash or Maya wallet from Canada?",
        answer:
          "Yes — several of the providers in this comparison support direct payout to GCash and Maya in addition to bank deposit and cash pickup, and wallet payouts are typically the fastest option.",
      },
      {
        question: "Does SulitSend charge anything to use this comparison?",
        answer:
          "No — SulitSend is free to use. Some providers pay us a referral commission if you sign up through our links, but you pay the same price either way; it never affects the rates or ranking shown here.",
      },
    ],
  },
  {
    slug: "aud-to-php",
    from: "AUD",
    to: "PHP",
    fromLabel: "Australia",
    toLabel: "the Philippines",
    defaultAmount: 1000,
    hasCompareCTA: false,
    title: "Send Money from Australia to the Philippines (AUD → PHP)",
    metaDescription:
      "Compare live AUD to PHP exchange rates and fees for sending money from Australia to the Philippines across Wise, Western Union, Remitly, and more.",
    intro: [
      "Australia's Filipino community includes a large share of nurses, aged-care and hospitality workers concentrated around Sydney, Melbourne, and Perth, many sending money home on a recurring schedule. Over a year of transfers, the exchange rate margin adds up to far more than any single flat fee.",
      "Below is a live snapshot of what an AU$1,000 transfer actually delivers in PHP across Australian banks and remittance specialists, updated hourly from each provider's own pricing.",
    ],
    faq: [
      {
        question: "What's the cheapest way to send money from Australia to the Philippines?",
        answer:
          "The cheapest option changes as providers rotate promotions, which is why this table refreshes hourly rather than naming one fixed winner. Providers that quote near the mid-market rate with a small stated fee (Wise, OFX) typically beat banks and cash networks that build their margin into the exchange rate. Compare the \"recipient gets\" column above, not the advertised fee alone.",
      },
      {
        question: "How long does an AUD to PHP transfer take?",
        answer:
          "Bank deposits generally arrive within a few hours to one business day. GCash and Maya wallet payouts are often near-instant once the sender's payment clears. Cash pickup is usually available within minutes of the transfer being funded, subject to the receiving branch's hours.",
      },
      {
        question: "Are Australian banks like ANZ, Commonwealth Bank, or NAB competitive for this corridor?",
        answer:
          "They're included in this comparison, but banks typically quote a wider margin below the mid-market rate than dedicated remittance apps, even when they advertise low or no transfer fees. Check the exchange rate column above against the mid-market rate shown, not just the fee, before choosing a bank transfer for convenience.",
      },
      {
        question: "Can I send AUD straight to a GCash or Maya wallet from Australia?",
        answer:
          "Yes — most of the specialist and fintech providers in this comparison support direct payout to GCash and Maya alongside bank deposit and cash pickup, and wallet payouts are usually the fastest way for the recipient to access the money.",
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
