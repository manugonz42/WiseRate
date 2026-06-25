# Design System

Dark theme only (for now). Mobile-first. Values below are the canonical tokens — iOS `Design/Theme/Colors.swift` and the web `:root` vars in `index.html` already match.

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

## Gradients

- **Primary**: `linear-gradient(135deg, primary → primary-light)` — used on hero text, key buttons.
- **Hero**: stronger primary gradient with accent stops (see Home hero card).

## Spacing

`xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32 · xxxxl 40` (pixels / pt / dp).

Defaults: screen padding `xl (20)`, card padding `lg (16)`, card-to-card gap `md (12)`.

## Radius

`xs 8 · sm 12 · default 16` (full pill = height/2).

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
