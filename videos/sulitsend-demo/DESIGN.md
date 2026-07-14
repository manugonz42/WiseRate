# DESIGN.md — SulitSend brand cheat sheet (video)

Source of truth: `capture/extracted/tokens.json` + live site. Canonical spec: `docs/architecture/design-system.md` (pistacho light theme).

## 1. Visual Theme

SulitSend is light-first "pistacho": a soft green-tinted off-white (`#F2F6E4`) page with white cards, dark forest-ink (`#1E2A12`) text, and a loud chartreuse (`#C8F135`) reserved for the winner/best-deal moments. The signature move is the **hard 2–4px offset shadow** (`0 3px 0 var(--primary)`) on chips and CTAs — playful, sticker-like, never blurred. Type is Outfit everywhere, ExtraBold (800) for display with tight tracking. Mood: friendly fintech for the Filipino community — warm, honest, a little cheeky (crown 👑 on the winner), never corporate-cold. The dark ink `#1E2A12` also acts as a full surface (hero card, "Send with" buttons) with `#F2F6E4`/chartreuse text on it.

## 2. Quick Reference

### Colors

| Name | HEX | Role |
|---|---|---|
| Pistacho bg | `#F2F6E4` | page background, text on ink |
| Ink | `#1E2A12` | text, dark surfaces, hard shadows |
| Chartreuse pop | `#C8F135` | winner card bg, logo gradient end |
| Lime leaf | `#C6E84E` | logo gradient start, accents on ink |
| Deep lime | `#7BA428` | pop-shadow color under light CTAs |
| Card white | `#FFFFFF` | cards, table rows |
| Elevated | `#E7EDD3` | secondary surfaces, podium-3 |
| Text secondary | `#5D6A45` | subcopy on light |
| Text tertiary | `#8A936F` | captions, labels on light |
| Success | `#517D12` | positive deltas, quote green |
| Error red | `#C93A3A` | negative rate deltas |

Contrast (AA): ink on pistacho ✔ (13.9:1) · ink on chartreuse ✔ (10.4:1) · pistacho on ink ✔ · `#5D6A45` on white ✔ (5.9:1) · `#8A936F` on white ✘ **fails body-size AA (3.2:1) — use only ≥24px or switch to `#5D6A45`** · `#C6E84E` on ink ✔ (9.5:1).

### Fonts

- **Outfit** (variable 400–800): everything. Display = 800, tracking -0.02em. Labels/eyebrows = 600–700, uppercase, +0.08em. Files: `assets/fonts/outfit-latin.woff2` + `outfit-latin-ext.woff2` (latin-ext carries ₱ U+20B1).
- No mono in brand UI (Geist Mono is Next.js dev only — don't use).

### Components

- **Logo**: 8×8 (scale up) rounded-`10px` square, `linear-gradient(135deg,#C6E84E,#C8F135)`, ₱ in 800 ink, shadow `0 3px 0 #1E2A12`; wordmark "sulitsend" lowercase 800 tracking-tight.
- **Chip/CTA (light)**: white or chartreuse bg, radius 14px, shadow `0 3px 0 #7BA428`.
- **CTA (on winner card)**: ink bg, chartreuse text, radius 18px.
- **Card**: white, radius 18px, shadow `0 2px 0 rgba(30,42,18,.1)`.
- Radii: 10 / 14 / 18px only.

### Do / Don't

- ✔ Hard offset shadows (0 blur) in ink or deep-lime; ✘ soft drop shadows on chips.
- ✔ Chartreuse only for the winner/best moment — scarcity is the point.
- ✔ Peso amounts get the ₱ glyph and 800 weight.
- ✘ No gradients except the logo tile (135°, lime→chartreuse).
- ✘ No dark-cinematic look — dark scenes use Ink `#1E2A12`, never black; grain/vignette off-brand.
- ✘ Brand name in copy is **SulitSend** (UI wordmark lowercase "sulitsend"), never WiseRate.
