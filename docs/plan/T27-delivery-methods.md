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

If a candidate works:
- Extend `remitly.ts` (`buildRequest`/`fetchRemitly`) with an optional `method?: DeliveryMethod` mapped to the working param (`cashPickup`→`CASH_PICKUP`, `mobileWallet`→`MOBILE_WALLET`; `bankTransfer`/undefined = today's request). Set the returned quote's `deliveryMethod` accordingly.
- Pass `method` through in `quotes.ts` (`fetchRemitly(from, to, amount)` call site), like WU/TransferGo already do.
- Commit one fixture per working method under `__fixtures__/` (naming pattern: `remitly.eur-php-1000.<method>.json`) + parser tests in `__tests__/remitly.test.ts` following the existing style.

## Part B — inclusive filter (always do this)
Binding decisions for `web/app/(tabs)/compare/page.tsx`:
- A row passes the method filter iff `q.deliveryMethod === method` **OR** `PROVIDERS[q.providerID]?.deliveryMethods?.includes(method)` (editorial capability data). Providers without an editorial profile = bankTransfer-only, as today.
- Apply the same predicate to `methodMatched` (so `best` never points at a hidden row).
- Rows shown via the editorial branch (quote method ≠ selected) get a small tag chip next to the source tag: text `bank-transfer price`, `title="This provider offers this method, but the live price shown is for a bank transfer"`. Reuse `SourceTag`'s chip styling.
- Update `docs/modules/comparison.md` (filter semantics + tag) and the stale code comment above `MethodFilter`.

## Verify
- Playwright: select "Cash pickup" → Western Union (repriced) AND Remitly (direct if Part A worked, else tagged editorial row) AND any other provider whose profile lists cashPickup all appear; tag chip present exactly on non-repriced rows. "Mobile wallet" similarly.
- If Part A worked: manually compare the Remitly cash-pickup quote at €1000 against remitly.com's own calculator; record the check (dated) in this file.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No new providers, no scraping, no changes to WU/TransferGo parsers, no per-method fee editing in `providers.ts` (capability lists there are already editorial facts — don't invent new ones).
