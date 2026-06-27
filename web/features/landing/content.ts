// Landing copy + structured-data source. Kept in one place so the visible
// sections (Faq, HowItWorks, Bento, SocialProof) and the JSON-LD in page.tsx
// never drift. No em/en-dashes in any visible string (taste-skill §9.G).

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "How does WiseRate find the best rate?",
    a: "We pull live quotes from 15+ transfer providers for the EUR to PHP corridor, add each provider's fee to its exchange rate, and rank them by how many pesos actually land in the recipient's account.",
  },
  {
    q: "Is WiseRate free to use?",
    a: "Yes. Comparing rates is free. When you pick a provider we may earn a referral fee, which never changes the price you pay.",
  },
  {
    q: "Why compare the total cost instead of just the rate?",
    a: "A headline exchange rate can hide a high fixed fee. WiseRate folds the fee into the rate so you see the real amount received, not a number that looks good in isolation.",
  },
  {
    q: "Can I get alerted when the rate improves?",
    a: "Set a target rate and WiseRate notifies you when EUR to PHP crosses it, so you can send at the right moment instead of watching the market.",
  },
  {
    q: "Which providers are included?",
    a: "Wise, Revolut, Western Union, Remitly, WorldRemit, Xoom, MoneyGram, N26 and more, plus major Spanish banks for the EUR to PHP corridor.",
  },
];

export interface Step {
  title: string;
  body: string;
}

// Verb-led, no "Step 1 / Step 2" labels (taste-skill §9.F).
export const STEPS: Step[] = [
  {
    title: "Enter your amount",
    body: "Type how many euros you want to send. WiseRate reprices every provider instantly.",
  },
  {
    title: "Compare the real cost",
    body: "See the pesos received after fees, side by side, ranked best first.",
  },
  {
    title: "Send with the best provider",
    body: "Tap through to the winner and send. Set a rate alert to catch the next dip.",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I used to lose a chunk to fees every month. Now I check WiseRate first and a few extra hundred pesos reach my mom in Cebu.",
    name: "Maria Santos",
    role: "Nurse in Madrid",
  },
  {
    quote:
      "The rate alert paid for itself the first week. I sent when EUR to PHP spiked instead of guessing.",
    name: "Jericho dela Cruz",
    role: "Sends home to Davao",
  },
];

// Confirmed-available Simple Icons slugs (white monochrome rendered on dark).
export const LOGO_BRANDS: { slug: string; name: string }[] = [
  { slug: "wise", name: "Wise" },
  { slug: "revolut", name: "Revolut" },
  { slug: "westernunion", name: "Western Union" },
  { slug: "paypal", name: "PayPal" },
  { slug: "n26", name: "N26" },
  { slug: "moneygram", name: "MoneyGram" },
];
