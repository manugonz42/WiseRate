# T08 — Brokers card in Compare (high-amount tier)

## Dependencies
- **Reads:** [brokers](../modules/brokers.md) (the spec — binding, including acceptance criteria), [comparison](../modules/comparison.md)
- **Task deps:** none

## Used by
- Recurring-revenue leg of Phase 1 monetization (lifetime rev-share per referred client's trades)

## Goal
When the Compare amount is ≥ €5,000, show a clearly-separated specialist-broker card below the quote list, per `docs/modules/brokers.md`.

## Pre-made decisions
- `web/lib/brokers.ts`:
  ```ts
  export const BROKER_THRESHOLD_EUR = 5000;
  export interface Broker { id: string; name: string; url: string; pitch: string; corridors: "all" | string[]; }
  export const BROKERS: Broker[] = [
    { id: "torfx", name: "TorFX", url: "https://www.torfx.com/", pitch: "...", corridors: "all" },
    { id: "currencies-direct", name: "Currencies Direct", url: "https://www.currenciesdirect.com/", pitch: "...", corridors: "all" },
    { id: "ofx", name: "OFX", url: "https://www.ofx.com/", pitch: "...", corridors: "all" },
  ];
  ```
  Plain homepage URLs with a `// TODO(human): replace with introducer/partner URLs once agreements are signed` comment. Write short factual pitches (dedicated dealer, no/low fees on large transfers, phone service) — no rate claims, no superlatives.
- No logos yet (no licensed assets) — use a neutral initial-letter avatar in the card.
- Analytics: `console.info("analytics: compare.broker_outbound", { brokerID, amountBucket })` where `amountBucket` = `"5k-10k" | "10k-50k" | "50k+"` (T10 replaces).

## Steps
1. Create `web/lib/brokers.ts` as above.
2. Broker card component rendered in `web/app/(tabs)/compare/page.tsx` **below the quote list**, only when `sendAmount >= BROKER_THRESHOLD_EUR` — implement every acceptance criterion in [brokers](../modules/brokers.md) exactly (visual separation, "specialist broker — quote via registration/phone" label, disclosure line, no layout shift below threshold).
3. CTA "Get a quote" → broker URL, `target="_blank" rel="sponsored noopener"`.
4. Update [MODULES.md](../MODULES.md) Brokers/Web ☐→◐. Check off T08.

## Verify
Amount 4 999 → nothing; 5 000 → card with 3 brokers, distinct styling, disclosure; CTA opens site; console event fires with correct bucket. `npm run build && npm run lint`.

## Out of scope
Broker quotes/ranking (they publish none — never mix into the ranked rows), partner URLs (human), iOS/Android ports, corridor filtering beyond the `corridors` field ("all" until agreements confirm coverage).
