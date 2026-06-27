# Data Model

Canonical entities. Source of truth for Swift structs (`WiseRate/Core/Models/Models.swift`), Kotlin data classes (Android), and TS interfaces (Web).

## Dependencies
- **Reads:** — (root spec; depends on nothing)
- **Future:** ⏳ JSON schema generation for cross-platform type codegen

## Used by
- Every [module](../modules/) and every [service](../services/) — this file is the universal contract.
- [platforms/ios.md](../platforms/ios.md), [platforms/web.md](../platforms/web.md), [platforms/android.md](../platforms/android.md) bind types to it.

## Entities

### TransferProvider
Static metadata about a money-transfer service (Wise, Remitly, etc.).
```
id              string
name            string
iconName        string
brandColor      enum<Color>
trustScore      number    // 0..1
userRating      number    // 0..5
websiteURL      string
affiliateURL    string?
isSponsored     boolean
```

### TransferQuote
A single rate offer from a provider, at a given amount and pair.
```
id              uuid
providerID      string
providerName    string
providerIcon    string
sendAmount      number
sendCurrency    string    // ISO 4217 (EUR)
receiveCurrency string    // ISO 4217 (PHP)
exchangeRate    number
fee             number
feeCurrency     string
receiveAmount   number
deliveryEstimate DeliveryEstimate
deliveryMethod  DeliveryMethod
markup          number    // 0..1
rateValidUntil  date?
isPromotion     boolean
promotionText   string?

// derived
totalCost          = fee + (sendAmount * markup)
effectiveRate      = receiveAmount / sendAmount
markupPercentage   = markup * 100
```

### DeliveryEstimate
```
minMinutes  int
maxMinutes  int
label       string         // "Instant", "Minutes", "1-24 hours", ...
```

### DeliveryMethod (enum)
`bankTransfer | cashPickup | mobileWallet | homeDelivery | debitCard`

### HistoricalRate
```
id        uuid
date      date
rate      number
provider  string?
```

### RateAlert
```
id           uuid
targetRate   number
isEnabled    boolean
createdAt    date
triggeredAt  date?
notifyType   enum            // rateAbove | rateBelow | providerCheapest
```

### UserProfile
```
id                       uuid
name                     string
email                    string
avatarURL                string?
isPremium                boolean
preferredSendCurrency    string     // "EUR"
preferredReceiveCurrency string     // "PHP"
defaultDeliveryMethod    DeliveryMethod
alerts                   RateAlert[]
recentProviders          string[]   // provider ids
favoriteProviders        string[]
```

### ComparisonResult
```
id            uuid
amount        number
fromCurrency  string
toCurrency    string
quotes        TransferQuote[]
timestamp     date

// derived
bestQuote      = max receiveAmount
cheapestQuote  = min totalCost
fastestQuote   = min deliveryEstimate.maxMinutes
```

### SponsoredOffer
```
id                  uuid
providerName        string
providerIcon        string
headline            string
description         string
ctaText             string
affiliateURL        string
validUntil          date
discountPercentage  number?
```

### ProviderDetail
Extends TransferProvider with the deep-dive view payload.
```
description        string
reviewCount        int
transferLimits     { minAmount, maxAmount, currency }
fees               FeeStructure[]
deliveryMethods    DeliveryMethod[]
pros               string[]
cons               string[]
historicalRates    HistoricalRate[]
```

`FeeStructure`: `{ method: DeliveryMethod, fixedFee, percentageFee, description }`

## Conventions

- All currency values: number in major units (EUR, not cents).
- Dates: ISO 8601 strings on the wire; native Date types in models.
- IDs: UUID v4 for client-generated, opaque strings from server otherwise.
- Currencies: ISO 4217 codes uppercase.
