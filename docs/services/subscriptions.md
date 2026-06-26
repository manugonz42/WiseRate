# Service: Subscriptions / IAP

SendRate Premium. One entitlement: `isPremium`. Two SKUs.

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md) (`UserProfile.isPremium`)
- **Future:** ⏳ backend reconciliation endpoint (verify App Store / Play / Stripe receipts), ⏳ RevenueCat (unify all three platforms)

## Used by
- [premium](../modules/premium.md) (purchase flow)
- [settings](../modules/settings.md) (manage subscription)
- [profile](../modules/profile.md) (Premium badge)
- [analytics](../modules/analytics.md) (gates ≥3M historical)
- [alerts](../modules/alerts.md) (free cap = 3 alerts)
- [provider-details](../modules/provider-details.md) (gates >30D historical)

## SKUs

| SKU id | Period | Price (USD) | Notes |
|---|---|---|---|
| `sendrate_premium_monthly` | 1 month | 4.99 | matches `PremiumViewModel` |
| `sendrate_premium_yearly` | 1 year | 39.99 | "save 33%" badge |

Local-currency pricing comes from the platform store.

## What Premium unlocks (v1)

- Unlimited rate alerts (free: 3)
- Historical range up to 1Y (free: 30D)
- Ad-free (no sponsored cards)
- Faster refresh interval

## Per-platform impl

| Platform | Tech |
|---|---|
| iOS | **StoreKit 2** — `Product.products(for:)`, `Transaction.currentEntitlements`, `Transaction.updates` listener at app start |
| Android | **Play Billing v6+** — `BillingClient` + `PurchasesUpdatedListener` |
| Web | **Stripe Checkout** with subscription mode + webhook |

## Server reconciliation

Each purchase is verified server-side (App Store / Play / Stripe). The server maintains the canonical entitlement keyed by user account. Clients show optimistic `isPremium = true` immediately after a successful client-side purchase, then confirm via the backend within 30s.

**Option to revisit**: use **RevenueCat** to unify all three platforms behind one API. Likely worth it past v1.

## Restore purchases

Standard flow on iOS/Android (button in Settings → Subscriptions). Web restores via account login.

## iOS status (implemented)

`SendRate/Core/Services/Subscriptions/SubscriptionService.swift` — StoreKit 2.

- `getAvailablePlans()` returns the two `SubscriptionPlan`s; each maps to a product id via `productID`
  (`sendrate_premium_monthly` / `sendrate_premium_yearly`).
- `getSubscriptionStatus()` derives the entitlement from `Transaction.currentEntitlements` (verified,
  unexpired, not revoked) → `.premium(plan:)` else `.free`.
- `purchasePlan(_:)` resolves the `Product`, calls `purchase()`, verifies, finishes, and optimistically
  caches premium. `restorePurchases()` calls `AppStore.sync()` then re-reads status.
- A `Transaction.updates` listener starts in `init` (touched at launch from `SendRateApp`) to catch
  renewals / external purchases.
- Entitlement is **cached only** (boolean on `UserProfile.isPremium` + `premiumExpiry` setting via
  `PersistenceService`); the App Store remains source of truth.
- **Not done:** server receipt reconciliation + RevenueCat (⏳ above); a `.storekit` config file +
  App Store Connect products to add when the `.xcodeproj` is created. Build-unverified (no Swift toolchain).

## Replaces

~~`SubscriptionService` in `SendRate/Core/Services/Services.swift`~~ — moved to its own file
(see iOS status above).

## Receipt storage

Never store raw receipts client-side beyond what the platform retains. Cache only the entitlement boolean + expiry timestamp.
