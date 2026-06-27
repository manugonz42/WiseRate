# Design System

Dark theme only. **Responsive: mobile → desktop** — iOS/Android are native mobile; the web is a **full-web responsive** app (see [web platform](../platforms/web.md)). Values below are the canonical tokens — iOS `Design/Theme/Colors.swift` and the web `:root` vars in `index.html` already match.

## Dependencies
- **Reads:** — (root spec)
- **Future:** ⏳ light theme tokens, ⏳ accessibility audit (contrast ratios, motion-reduce)

## Used by
- Every [module](../modules/) (tokens consumed in views)
- All three [platforms](../platforms/) (bind tokens to native theme)

## Colors

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0A0A0A` | screen background |
| `surface` | `#141414` | card |
| `surface-elevated` | `#1C1C1E` | nested card / popover |
| `surface-hover` | `#232325` | hover/press state |
| `border` | `rgba(255,255,255,0.08)` | divider, card outline |
| `border-subtle` | `rgba(255,255,255,0.04)` | quieter divider |
| `primary` | `#6C5CE7` | CTA, accent, brand |
| `primary-light` | `#A29BFE` | gradient end |
| `primary-dark` | `#4A3DB5` | pressed primary |
| `accent` | `#00D2D3` | secondary highlight |
| `success` | `#00C48C` | gains, positive delta |
| `warning` | `#FFB800` | caution |
| `error` | `#FF4757` | error, loss |
| `text-primary` | `#FFFFFF` | body |
| `text-secondary` | `rgba(255,255,255,0.6)` | meta |
| `text-tertiary` | `rgba(255,255,255,0.35)` | placeholder |

### Web palette override (Emerald)

The **web app only** moves off the purple brand to an emerald accent on a green-black base
(taste-skill LILA rule — purple read as the AI-default tell for a marketing surface). iOS and
Android keep the purple tokens above. Web values live in `web/styles/tokens.css`:

| Token | Web (emerald) |
|---|---|
| `bg` | `#0A0F0D` |
| `surface` | `#141A17` |
| `surface-elevated` | `#1C241F` |
| `surface-hover` | `#232E27` |
| `primary` | `#10B981` |
| `primary-light` / `accent` | `#34D399` |
| `primary-dark` | `#059669` |
| `success` | `#10B981` (unified with the accent) |
| `on-primary` | `#08110D` (text on emerald fills, WCAG AA) |

`warning`, `error`, text and border tokens are unchanged across platforms. This is a
deliberate, documented divergence from token parity (decided web-only).

## Gradients

- **Primary**: `linear-gradient(135deg, primary → primary-light)` — used on hero text, key buttons.
- **Hero**: stronger primary gradient with accent stops (see Home hero card).

## Spacing

`xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32 · xxxxl 40` (pixels / pt / dp).

Defaults: screen padding `xl (20)`, card padding `lg (16)`, card-to-card gap `md (12)`.

## Radius

`xs 8 · sm 12 · default 16` (full pill = height/2).

## Breakpoints (web)

Aligned with Tailwind: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536` (px).

- Content container: fluid up to **`max-w-6xl`**, centered; horizontal padding scales with breakpoint (`px-lg` mobile → `px-xxl`+ desktop).
- `< md` = mobile layout (1 column, bottom tab bar). `≥ md` = web layout (top nav, multi-column grids).
- Native apps ignore breakpoints — they bind tokens only.

## Typography

Family: **Inter** on web, `.rounded` system on iOS, Inter on Android.

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

Number-heavy displays (rate, receive amount) use a tabular variant and may bump weight one notch.

## Shadows

- `default` — `0 4 12 rgba(0,0,0,.35)` for cards
- `elevated` — `0 12 24 rgba(0,0,0,.5)` for popovers
- `none` — outlined / glass cards

## Animation

Standard easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
Durations: `quick 150ms · standard 250ms · smooth 350ms · bouncy 450ms (spring) · gentle 600ms`.

## Component library (iOS canonical)

- **Card** — 5 styles: `default`, `elevated`, `outlined`, `glass`, `highlight`
- **PrimaryButton** — full-width primary CTA, supports loading state
- **Avatar** — rounded image + initials fallback
- **Input** — see `Design/Components/Input/Inputs.swift`
- **Chip** — sort/filter selector (Comparison)
- **RateBadge** — number + delta arrow (Home, Analytics)

Each platform re-implements these atop the same tokens. Component API parity is a non-goal — token parity is the goal.

**Web navigation (responsive):** `TopNav` (logo + links, shown `≥ md`) and `MobileTabBar` (bottom bar, shown `< md`) are the web's responsive nav pattern — no equivalent on native, which use their own tab bars.
