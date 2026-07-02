# Service: Subscriptions / IAP

SulitSend Premium. One entitlement: `isPremium`. Two SKUs.

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
| `wiserate_premium_monthly` | 1 month | 4.99 | matches `PremiumViewModel` |
| `wiserate_premium_yearly` | 1 year | 39.99 | "save 33%" badge |

Local-currency pricing comes from the platform store.

SKU ids keep the legacy `wiserate_` prefix — rename to `sulitsend_` **before** they're registered in App Store Connect / Play Console (immutable once live). See [ROADMAP](../ROADMAP.md) Phase 1 rename item.

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

## Replaces

`SubscriptionService` in `WiseRate/Core/Services/Services.swift`. **iOS done** (StoreKit 2): `Product.products(for:)`, `product.purchase()` with verification, `Transaction.currentEntitlements` for status, `Transaction.updates` listener started at launch, `AppStore.sync()` for restore. SKU ids via `SubscriptionPlan.productID`. Server reconciliation still pending. Sim testing needs the bundled `WiseRate/Resources/Products.storekit` selected in the scheme.

## Receipt storage

Never store raw receipts client-side beyond what the platform retains. Cache only the entitlement boolean + expiry timestamp.
