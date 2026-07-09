# Module: Promos

**Status:** iOS ☐ · Web ✅ · Android ☐

## Dependencies
- **Reads:** [comparison](comparison.md) (promo badge conventions), [navigation](../architecture/navigation.md), [analytics service](../services/analytics.md), `web/lib/data/providers.ts`, `web/lib/models/types.ts`, `web/lib/services/persistence.ts`
- **Used by:** [settings](settings.md) (T30, provider accounts reused), [onboarding](onboarding.md) (T31, accounts component reused)

## Used by
- `A_mejorar.md` items 9, 10; T30, T31

## Purpose
Searchable hub of all known promos (API-detected first-transfer + editorial referral), with optional personalization by which providers the user already has accounts with (localStorage).

## Inputs
- `getQuotes(1000)` — pull all first-transfer promos from the API
- `PROVIDERS` — editorial referral promos via `referralPromo` field
- `listProviderAccounts()` — which providers user has marked as existing accounts

## Outputs / Actions
- Search text input (150ms debounce) → filters provider name + description
- Checkbox per provider → toggle account status, persist, dim matching first-transfer promos
- "Claim" CTA on promo card → open affiliate/website URL in new tab (`target="_blank" rel="sponsored noopener"`), track `promos.affiliate_outbound { providerID }`
- Toggle provider account → track `promos.account_toggled { providerID, checked }`
- Search debounce finish → track `promos.search { queryLength }` (consent-gated)

## Acceptance criteria
- Page renders ≥1 first-transfer card when the route loads (Remitly/TransferGo/CurrencyFair publish them)
- Text search (150ms debounce, case-insensitive) narrows by provider name + description; empty reset shows all
- Checking a provider name dims its first-transfer promo card (`opacity-60`) with tooltip "You already have an account — first-transfer pricing usually won't apply"; referral promos are never dimmed
- Checkbox state persists across page reloads via localStorage (`sulitsend.providerAccounts.v1`)
- Cards show: provider icon, name, promo kind badge (FIRST TRANSFER / REFERRAL — same labels/colors as compare), description, conditions, value line, Claim CTA
- First-transfer value: `+₱{promoReceiveAmount − receiveAmount} on €1,000` (only when `baseIsStandard = true`; else show `promoReceiveAmount` with no-standard-price caveat)
- Referral value: the `amount` string verbatim
- All tabs (including Promos) render on mobile, tablet, and desktop without horizontal scroll or overflow
- Dark theme tokens only; UI copy says SulitSend

## Platform notes
- **Web**: `web/app/(tabs)/promos/page.tsx`
