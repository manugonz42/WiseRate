# Design System

**Pistacho** — light, playful, dopamine-first (direction 2a, chosen 2026-07 from `design/Direcciones.dc.html`). Mobile-first. The web app tokens in `web/styles/tokens.css` are the canonical implementation. iOS (`Design/Theme/Colors.swift`) and Android still carry the legacy dark theme — ⏳ re-skin lands with each platform's next active phase (see ROADMAP); until then token parity is web-only.

## Dependencies
- **Reads:** — (root spec)
- **Future:** ⏳ iOS + Android pistacho re-skin, ⏳ accessibility audit (contrast ratios, motion-reduce)

## Used by
- Every [module](../modules/) (tokens consumed in views)
- All three [platforms](../platforms/) (bind tokens to native theme)

## Colors

| Token | Hex | Use |
|---|---|---|
| `bg` | `#F2F6E4` | screen background (pistachio cream) |
| `surface` | `#FFFFFF` | card |
| `surface-elevated` | `#E7EDD3` | tinted card / popover |
| `surface-hover` | `#F7FAEC` | hover/press state |
| `border` | `rgba(30,42,18,0.10)` | divider, card outline |
| `border-subtle` | `rgba(30,42,18,0.05)` | quieter divider |
| `primary` | `#1E2A12` | ink — CTAs, selected chips, dark panels |
| `primary-light` | `#C6E84E` | pistachio lime — text/icons on primary, hero highlights |
| `primary-dark` | `#7BA428` | olive — links, hard CTA shadow, chart stroke |
| `chartreuse` | `#F5D93B` | decorative badge fills (never small text on light bg) |
| `accent` | `#8A7500` | small-text gold accent (badges on light bg) |
| `success` | `#517D12` | gains, positive delta |
| `warning` | `#9A6B00` | caution, best-deal banner |
| `error` | `#C93A3A` | error, loss |
| `text-primary` | `#1E2A12` | body |
| `text-secondary` | `#5D6A45` | meta |
| `text-tertiary` | `#8A936F` | placeholder |
| `podium-2` / `podium-3` | `#DFE9C4` / `#E7EDD3` | Home podium bar shades |

Rule of thumb: lime/chartreuse are **fills with ink text or accents on ink**, never small text on light backgrounds (contrast).

## Gradients

- **Lime**: `linear-gradient(180deg, primary-light, #B5DC3B)` — podium winner.

## Brand mark

The "Stripe S" tile replaces currency symbols as the app's primary mark. Three variants, used by background context:

| Variant | Asset | Where |
|---|---|---|
| **Terracotta** (orange tile, dark S) | `landing/public/logomark.png` | Landing (cream/editorial palette) — nav, footer, OG image, favicons |
| **Light** (lime tile, dark S) | `web/public/logomark.png` | Web app (matches current lime-icon tiles) — header/sidebar marks, favicon, OG image |
| **Dark** (dark tile, lime S) | `Iconos_nuevos/dark_stripe_s.png` | Reserved: iOS/Android app icon when their re-skin lands |

## Spacing

`xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32 · xxxxl 40` (pixels / pt / dp).

Defaults: screen padding `xl (20)`, card padding `lg (16)`, card-to-card gap `md (12)`.

## Radius

`xs 10 · sm 14 · default 18` (full pill = height/2). Chunkier than the legacy dark theme on purpose.

## Typography

Family: **Outfit** on web and Android, `.rounded` system on iOS. Weights 400/600/700/800; headings and numbers lean extrabold.

| Token | Size | Weight |
|---|---|---|
| largeTitle | 34 | 800 |
| title | 28 | 800 |
| title2 | 22 | 700 |
| title3 | 20 | 700 |
| headline | 17 | 600 |
| body | 17 | 400 |
| callout | 16 | 400 |
| subhead | 15 | 400 |
| footnote | 13 | 400 |
| caption | 12 | 400 |
| caption2 | 11 | 400 |

Number-heavy displays (rate, receive amount) use tabular figures and may bump weight one notch. Hero numbers animate with a count-up (see Animation).

## Shadows — hard offsets, not blurs

- `default` — `0 2px 0 rgba(30,42,18,0.10)` for cards/chips
- `elevated` — `0 4px 0 rgba(30,42,18,0.12), 0 12px 32px rgba(30,42,18,0.12)` for popovers/banners
- `pop` — `0 4px 0 primary-dark` for primary CTAs; pressing translates the element 4px down and flattens the shadow (`.btn-pop`)
- `chip` — `0 3px 0 primary-dark` for selected chips (`.chip-pop`)

## Animation

Standard easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
Durations: `quick 150ms · standard 250ms · smooth 350ms · bouncy 450ms (spring) · gentle 600ms`.

Dopamine set (all gated behind `prefers-reduced-motion`):
- **count-up** — hero numbers tween to new values (600ms, cubic ease-out)
- **rise** — entrance: translateY(14px) + fade, 60ms stagger per item
- **crown-bounce** — gentle 2.2s float on the podium crown
- **pulse-dot** — live-rate indicator blink

## Component library (iOS canonical)

- **Card** — 5 styles: `default`, `elevated`, `outlined`, `glass`, `highlight`
- **PrimaryButton** — full-width ink CTA, lime text, `pop` shadow, supports loading state
- **Avatar** — rounded image + initials fallback
- **Input** — see `Design/Components/Input/Inputs.swift`
- **Chip** — sort/filter selector; selected = ink fill + lime text + `chip` shadow
- **RateBadge** — number + delta arrow (Home, Analytics)

Each platform re-implements these atop the same tokens. Component API parity is a non-goal — token parity is the goal.
