# Module: Brokers (high-amount tier)

**Status:** iOS ☐ · Web ✅ (card live; placeholder URLs until introducer agreements) · Android ☐

## Dependencies
- **Reads:** [comparison](comparison.md) (host screen), [design-system](../architecture/design-system.md), [localization](../architecture/localization.md)
- **Navigates to:** external broker partner URL (system browser)
- **Future:** ⏳ [analytics service](../services/analytics.md) (outbound events), ⏳ signed introducer agreements (TorFX, Currencies Direct, OFX)

## Used by
- [comparison](comparison.md) — renders the broker card when `sendAmount ≥ threshold`
- [ROADMAP](../ROADMAP.md) Phase 1 — the recurring-revenue leg of monetization

## Why this exists (monetization)
Remittance affiliates pay **one-time CPA** per new customer (Wise £10, Remitly ~$2–20); no remittance provider rev-shares with comparison sites — per-transfer margin is too thin (~€2–4 on a €300 remittance). Currency **brokers** instead pay introducers a **lifetime revenue share on every trade** of a referred client. That is the only per-transaction, recurring income available without becoming a licensed payment institution. Brokers serve large transfers (property, relocation, pensions), not €300 remittances — hence the amount threshold.

## Behavior
- When the entered amount ≥ **€5,000** (single tunable const), Compare shows a "Sending a large amount? A specialist broker can beat these rates" card **below** the quote list — never mixed into the ranked rows: brokers publish no machine-readable quotes, so there is no `receiveAmount` to rank.
- Card lists 1–3 partner brokers: name, logo, one-line pitch (dedicated dealer, no fees above threshold, phone service), "Get a quote" CTA → partner URL.
- Same commission-disclosure copy as affiliate rows.
- Below threshold the module renders nothing (no layout shift).

## Inputs (data dependencies)
- `sendAmount`, `fromCurrency`, `toCurrency` from `ComparisonViewModel`
- Static broker config (id, name, partner URL, supported corridors, minimum) — `web/lib/brokers.ts`; no service call, no quotes fetch

## Outputs / Actions
- Tap broker CTA → outbound partner URL (analytics: `compare.broker_outbound { brokerID, amountBucket }`)

## Acceptance criteria
- Card appears only at ≥ €5,000 **and** only for corridors the broker actually serves (PHP coverage varies — verify per broker before listing)
- Visually distinct from quote rows and labeled as "specialist broker — quote via registration/phone", so it cannot be mistaken for a computed quote
- Disclosure text present
- `compare.broker_outbound` fires with brokerID + amount bucket
- Renders nothing below threshold

## Platform notes
- **Web**: `web/app/(tabs)/compare/page.tsx` + `web/lib/brokers.ts` (Phase 1)
- **iOS / Android**: after web validates click-through; reuse the same static config

## Open questions
- Threshold €5,000 vs €10,000 — broker rev-share is margin-based, small trades earn ~nothing; check each partner's effective minimum
- Which partners accept EUR→PHP? Confirm corridor coverage during introducer applications (TorFX/Currencies Direct focus on majors; OFX lists PHP)
- Do introducer agreements permit "comparison site" placement, or require specific presentation/compliance wording? (read contract terms before building UI copy)
