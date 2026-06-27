# Service: Provider Adapters

How the [quotes-server](quotes-server.md) pulls each provider's real numbers. One adapter per
provider, designed and filled **one at a time**, normalizing to the true-cost `Quote`. Data
sourcing is **APIs-first** (Wise Comparisons API + official/affiliate APIs); scraping is a
per-provider fallback only where no API exists.

## Dependencies
- **Reads:** [quotes-server](quotes-server.md) (`Quote` model, collector), [providers-eur-php](../reference/providers-eur-php.md) (`quoteSource`, `affiliateProgram`, license evidence), [data-model](../architecture/data-model.md) (`DeliveryMethod`)
- **Future:** ⏳ affiliate IDs / API credentials per provider; ⏳ Playwright worker for scrape-source adapters

## Used by
- [quotes-server](quotes-server.md) collector — invokes `fetchQuote` per (corridor × method × amount)

## Adapter interface

```
ProviderAdapter {
  id                                         // matches providers-eur-php.md id (e.g. "wise")
  source: 'wise-comparisons' | 'official-api' | 'affiliate-api' | 'scrape'
  supportedMethods: DeliveryMethod[]
  supportedAmountRange: { min, max }
  fetchQuote(corridor, amount, method) -> Quote   // returns the true-cost Quote
}
```

Adapters must populate every cost component of the `Quote` (`fundingFee`, `providerFee`, `fxRate`,
`payoutFee`, `receiveAmount`) from the provider's own response — no mid-market derivation. If a
provider can't be quoted for the requested method/amount, the adapter returns nothing (excluded
from results) rather than guessing.

**Wise Comparisons API** is special-cased: one call returns many providers, so a single adapter
seeds several `Quote` rows. Population order follows the `quoteSource` column in
[providers-eur-php](../reference/providers-eur-php.md).

## Per-provider template

Fill one block per provider as it's wired (copy this template; `TODO` until verified):

```
### <provider id>
- source:            official-api | affiliate-api | wise-comparisons | scrape
- endpoint / URL:    TODO
- auth:              TODO (API key / affiliate ID / none)
- request shape:     TODO (params: from, to, amount, method, fundingMethod)
- response mapping:  receiveAmount ← TODO ; fxRate ← TODO ; providerFee ← TODO ;
                     fundingFee ← TODO ; payoutFee ← TODO ; rateValidUntil ← TODO
- funding methods:   TODO (which funding options change the cost; default assumed)
- amount tiers:      TODO (fee-free threshold? % fee bands? FX tiers?)
- methods supported: bankTransfer | cashPickup | mobileWallet | homeDelivery | debitCard
- quirks / ToS:      TODO (rate limits, scraping legality, captcha, expiry behavior)
```

## Scraping fallback

Only for providers with no usable API. Implemented as a **separate Playwright/Puppeteer worker**
feeding the same collector — kept apart so it never blocks the API path. Note: no ready-made
scraping skill exists in this environment; respect each provider's ToS and the legality bar in
[providers-eur-php](../reference/providers-eur-php.md) before enabling a scrape adapter.

## Open questions

- Which providers expose an official/affiliate quote API vs require scraping (track in `quoteSource`).
- Per-provider funding-method matrix — card vs bank-debit can materially change `totalCostEUR`.
