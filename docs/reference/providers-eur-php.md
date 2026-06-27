# Reference: Providers — EUR→PHP corridor (Spain → Philippines)

Curated source of truth for **which money-transfer providers are legal and reliable** for
sending EUR from Spain to PHP, and **which banks both run a referral program and offer a
price-competitive EUR→PHP transfer**. Inclusion is evidence-based (regulator + register entry),
not brand recognition. Cells marked `TODO` await verification (see *How to maintain*); do not
fill them with unverified data.

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md) (`TransferProvider`, `TransferQuote`, `DeliveryMethod`), [exchange-rate](../services/exchange-rate.md) (quote sourcing), [referral](../modules/referral.md) (referral concept)
- **Future:** ⏳ population of `licenseNo` / `registerURL` / `affiliateURL` via verification pass; ⏳ seeding real data into `WiseRate/Data/Mock/MockData.swift` + Android mirror

## Used by
- [exchange-rate](../services/exchange-rate.md) — resolves the "provider partnership / affiliate IDs" open question and classifies quote sources
- [comparison](../modules/comparison.md), [provider-details](../modules/provider-details.md) — define the real provider universe these screens rank
- `WiseRate/Data/Mock/MockData.swift` + `android/.../data/mock/MockData.kt` — future real seed

## Inclusion criteria ("100% fiable y legal")

A provider qualifies for **List A** only if **all** of the following hold:

1. **Licensed** — registered as Entidad de Pago (EP/PI) or Entidad de Dinero Electrónico (EDE/EMI)
   in the *Registro de Entidades* of **Banco de España**, **or** an EU EMI/PI **passported into
   Spain** (verifiable in the home regulator's register + EBA passporting register).
2. **Active EUR→PHP corridor** — officially supports sending from Spain to the Philippines.
3. **Reputable** — established operating history, no active regulatory sanction.

Evidence (regulator + license/registry number + register URL) is recorded per row so the bar is
auditable. Banks that clear the bar but are evaluated for referral/competitiveness live in List B.

## List A — legal & reliable providers

| id | name | legalEntity | regulator + licenseNo | registerURL | licenseType | EUR→PHP | deliveryMethods | affiliateProgram | quoteSource | website / affiliateURL |
|---|---|---|---|---|---|:-:|---|---|---|---|
| wise | Wise | Wise Europe SA | TODO (NBB/Banco de España passport) | TODO | EMI-passport | TODO | bankTransfer, mobileWallet | TODO (network?) | Wise Comparisons API / official | TODO |
| remitly | Remitly | TODO | TODO | TODO | EMI/EP | TODO | bankTransfer, cashPickup, mobileWallet | TODO (Impact?) | official API / scrape | TODO |
| worldremit | WorldRemit | TODO | TODO (FCA EMI) | TODO | EMI-passport | TODO | bankTransfer, cashPickup, mobileWallet, airtime | TODO | scrape / affiliate | TODO |
| xoom | Xoom (PayPal) | TODO | TODO | TODO | EMI | TODO | bankTransfer, cashPickup, mobileWallet | TODO | scrape | TODO |
| western_union | Western Union | TODO | TODO | TODO | EP/EDE | TODO | bankTransfer, cashPickup, homeDelivery | TODO | affiliate / scrape | TODO |
| moneygram | MoneyGram | TODO | TODO | TODO | EP | TODO | bankTransfer, cashPickup | TODO | scrape | TODO |
| revolut | Revolut | Revolut Bank UAB | TODO (Lietuvos bankas) | TODO | bank/EMI | TODO | bankTransfer, mobileWallet | TODO | manual | TODO |
| n26 | N26 | N26 Bank AG | TODO (BaFin) | TODO | bank | TODO | bankTransfer (Wise-powered) | TODO | manual | TODO |
| skrill | Skrill | TODO | TODO (FCA EMI) | TODO | EMI-passport | TODO | mobileWallet, bankTransfer | TODO | scrape | TODO |
| ofx | OFX | TODO | TODO | TODO | EP/EMI | TODO | bankTransfer | TODO | scrape | TODO |
| xe | Xe | TODO | TODO | TODO | EP/EMI | TODO | bankTransfer | TODO | scrape | TODO |

> `deliveryMethods` map to the `DeliveryMethod` enum in [data-model](../architecture/data-model.md):
> `bankTransfer | cashPickup | mobileWallet | homeDelivery | debitCard`. PH mobile wallets =
> GCash / Maya (treat as `mobileWallet`).

## List B — banks: referral program + competitive EUR→PHP

A bank lands here only if it has **both**: (1) a referral scheme, **and** (2) a genuinely
price-competitive EUR→PHP path (not a high-markup SWIFT default).

| name | regulator | referralProgram (reward + URL) | eurPhpTransfer (method, supported?) | competitiveness (fee + FX markup @500€, dated) | canonical list | notes |
|---|---|---|---|---|---|---|
| Revolut | Lietuvos bankas | TODO | TODO | TODO | A or B (decide) | neobank, straddles A/B |
| N26 | BaFin | TODO | bankTransfer (Wise-powered) | TODO | A or B (decide) | transfers via Wise |
| BBVA | Banco de España | TODO | TODO | TODO | B | incumbent bank |
| Santander | Banco de España | TODO | TODO (One Pay FX?) | TODO | B | check One Pay FX corridor |
| CaixaBank | Banco de España | TODO | TODO | TODO | B | incumbent bank |
| ING | DNB (NL) passport | TODO | TODO | TODO | B | |

## How to maintain (verification / data-acquisition process)

1. **License check** — Banco de España *Registro de Entidades* (EP / EDE); for passported firms,
   the home regulator register (FCA, Lietuvos bankas, BaFin, CBI, DNB) + EBA passporting
   notifications. Record number + register URL in the row.
2. **Corridor check** — provider's own Spain→Philippines send page; confirm payout methods
   (bank, cash pickup, GCash/Maya wallet, home delivery).
3. **Referral / affiliate check** — provider affiliate page or network listing (Impact,
   Partnerize, CJ, or direct); capture program + signup URL. This unblocks the affiliate-ID
   open question in [exchange-rate](../services/exchange-rate.md).
4. **Competitiveness snapshot** — fee + FX markup vs mid-market for a 500 EUR reference send,
   **dated**. Populates List B and sanity-checks future live quotes. Snapshots are illustrative,
   not the live data path.
5. **Quote-source classification** — tag each List A row: `official API` / `Wise Comparisons API`
   / `server scrape` / `manual`. Drives which [provider-adapter](../services/provider-adapters.md)
   each provider gets in the [quotes-server](../services/quotes-server.md).
6. **Cadence** — re-verify licenses quarterly; refresh competitiveness snapshots opportunistically.

## Out of scope (later phases)

- Seeding real providers into `MockData.swift` / `MockData.kt`.
- Building `/api/quotes` proxy, scrapers, or affiliate-API integrations.
- Signing up to affiliate networks.
