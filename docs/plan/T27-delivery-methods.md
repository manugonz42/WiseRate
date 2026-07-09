# T27 — Delivery-method fidelity: Remitly per-method probe + inclusive filter

## Dependencies
- **Reads:** [comparison](../modules/comparison.md), [exchange-rate](../services/exchange-rate.md), `web/lib/services/providers/remitly.ts`, `web/lib/services/quotes.ts`, `web/lib/data/providers.ts`, `web/app/(tabs)/compare/page.tsx`
- **Task deps:** T24 (same compare file)

## Used by
- Compare method filter; `A_mejorar.md` item 7 (Remitly does offer cash pickup / GCash but never appears when filtering; filter shows only ~2 rows)

## Problem
Only Western Union and TransferGo re-price per method; every other quote is hardcoded `deliveryMethod: "bankTransfer"`, and the filter drops any row whose method ≠ selected. So "Cash pickup" shows ~1–2 rows even though Remitly (and others) support it.

## Part A — Remitly per-method quotes (bounded probe)
**Rules of engagement: this is a fixed-menu experiment, not open-ended research.**

1. Baseline: request the existing `buildRequest` URL (see `remitly.ts`) with curl; save the JSON.
2. Try **exactly** these variations, one at a time, each added to the baseline query string:
   - `delivery_method=CASH_PICKUP`
   - `delivery_method=MOBILE_WALLET`
   - `payout_method=CASH_PICKUP`
   - `payout_method=MOBILE_WALLET`
3. A candidate **works** iff the response is 200 AND `fee.total_fee_amount` or `exchange_rate.base_rate` differs from baseline.
4. **STOP RULE:** if none works, write a dated "Part A failed — params tried, results" note in this file, skip to Part B, and do **not**: try other parameter names, inspect Remitly's website/JS, add headless-browser fetching, or guess numbers.

**Part A outcome (2026-07-09):** Failed. Remitly API does not change quote for any of the four parameters tried:
- `delivery_method=CASH_PICKUP` — 2.99 fee, 69.67 rate, 71590 receive (no diff)
- `delivery_method=MOBILE_WALLET` — 2.99 fee, 69.67 rate, 71590 receive (no diff)
- `payout_method=CASH_PICKUP` — 2.99 fee, 69.67 rate, 71590 receive (no diff)
- `payout_method=MOBILE_WALLET` — 2.99 fee, 69.67 rate, 71590 receive (no diff)

All return identical results to baseline. No further parameter exploration; skipping to Part B.

## Part B — inclusive filter (always do this)
Binding decisions for `web/app/(tabs)/compare/page.tsx`:
- A row passes the method filter iff `q.deliveryMethod === method` **OR** `PROVIDERS[q.providerID]?.deliveryMethods?.includes(method)` (editorial capability data). Providers without an editorial profile = bankTransfer-only, as today.
- Apply the same predicate to `methodMatched` (so `best` never points at a hidden row).
- Rows shown via the editorial branch (quote method ≠ selected) get a small tag chip next to the source tag: text `bank-transfer price`, `title="This provider offers this method, but the live price shown is for a bank transfer"`. Reuse `SourceTag`'s chip styling.
- Update `docs/modules/comparison.md` (filter semantics + tag) and the stale code comment above `MethodFilter`.

## Verify
- **npm test && npm run build && npm run lint: ✓ PASS (2026-07-09)** — All checks green.
- **Inclusive filter logic verified:** Filter predicate in compare/page.tsx lines 139–151 correctly checks both `q.deliveryMethod === method` and `PROVIDERS[q.providerID]?.deliveryMethods?.includes(method)`. Same logic applied to methodMatched for best-deal calculation (lines 153–161).
- **EditorialMethodTag component:** Renders "bank-transfer price" chip with tooltip on rows where quote method ≠ selected method but provider profile lists capability (lines 450–467).
- **UI integration:** Tag included in both QuoteTableRow (desktop) and QuoteRow (mobile) components.
- **Spec updated:** comparison.md Delivery-method selector clause (line 33) documents new inclusive filter and tag chip behavior.
- **Part A outcome noted:** docs/plan/T27-delivery-methods.md line 24–27 records probe attempt and failure.

## Out of scope — do NOT
- No new providers, no scraping, no changes to WU/TransferGo parsers, no per-method fee editing in `providers.ts` (capability lists there are already editorial facts — don't invent new ones).
