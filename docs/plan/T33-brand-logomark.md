# T33 — Brand logomark rollout ("Stripe S" replaces ₱ / crossed arrows)

## Dependencies
- **Reads:** `Iconos_nuevos/{terracota,light,dark}_stripe_s.png` (source art), `web/app/(tabs)/layout.tsx`, `web/app/opengraph-image.tsx`, `landing/components/Logomark.tsx` (reference implementation, already migrated), [design-system](../architecture/design-system.md)
- **Task deps:** none (landing half already done, uncommitted)

## Used by
- Rebrand groundwork (ROADMAP Phase 1 rename item); iOS/Android re-skin later

## Goal
One brand mark everywhere: the "Stripe S" tile. Three variants, used by background context:

| Variant | Art | Where |
|---|---|---|
| **terracota** (orange tile, dark S) | `terracota_stripe_s.png` | Landing (cream/editorial palette) — **done**: `landing/public/logomark.png`, Nav, Footer, OG image, favicons |
| **light** (lime tile, dark S) | `light_stripe_s.png` | Web app (matches the current lime `--lime-icon` tiles): header/sidebar marks, favicon (done), OG image |
| **dark** (dark tile, lime S) | `dark_stripe_s.png` | Reserved: iOS/Android app icon when their re-skin lands (both still legacy dark theme), and any future dark-context surface |

State already in the working tree (verify, don't redo): `landing/` fully migrated (Logomark.tsx, opengraph-image.tsx, middleware matcher, icon.png 512, apple-icon.png 180) and `web/app/{icon,apple-icon}.png` already light-variant. Remaining work = web in-UI marks + web OG + spec + commit.

## Pre-made decisions (binding)
- **Source art must be squared first.** `light_stripe_s.png`/`dark_stripe_s.png` are 1051×1008 with drop-shadow bleed; `terracota` is 1024×1024. Crop to the tile's square bounds (shadow trimmed, tile centered, small transparent margin like `landing/public/logomark.png`) and export 512×512 → `web/public/logomark.png` (light variant; create `web/public/`). Use a PowerShell System.Drawing crop or any local tool — no online services.
- **Web Logomark component:** copy `landing/components/Logomark.tsx` verbatim to `web/components/Logomark.tsx` (next/image, `/logomark.png`, `aria-hidden`, size via className).
- **Replace the three ₱ brand tiles in `web/app/(tabs)/layout.tsx` only** (lines ~70, ~127, ~147): mobile header (`h-8 w-8`), Home desktop sidebar (`h-9 w-9`), narrow sidebar (`h-8 w-8`). Drop the gradient/`--lime-icon` span wrappers — the PNG is the whole tile (keep rounded corners only if the PNG's own radius looks wrong at 32px; it shouldn't). Every other ₱ in web is a currency amount — do not touch.
- **Web OG image** (`web/app/opengraph-image.tsx`): mirror the landing pattern exactly — drop `runtime = "edge"`, `readFileSync(public/logomark.png)` → base64 `<img width=128>` above the wordmark.
- No web middleware exists; nothing to exclude there.
- **Spec first:** `docs/architecture/design-system.md` — replace the line-40 "logo tile (135deg lime → chartreuse)" note with the brand-mark table above (asset paths + variant-per-surface rule). That's the only spec touch.
- **Commit plan:** one commit for the pending landing work + this plan doc, one for the web rollout (or a single combined commit — executor's call, but don't leave the landing diff uncommitted).

## Steps
1. Spec: update design-system.md brand-mark note.
2. Asset: square/trim light variant → `web/public/logomark.png` (512×512).
3. `web/components/Logomark.tsx` + swap the 3 tiles in `(tabs)/layout.tsx`.
4. `web/app/opengraph-image.tsx` → Node runtime + embedded mark.
5. Commit (landing pending diff included).

## Verify
- Playwright at 390px and 1280px on /home, /compare: mark renders crisp in header + both sidebars, no layout shift (tile still 32/36px), wordmark alignment unchanged.
- `curl localhost:3000/opengraph-image` (web) and landing equivalent return PNGs showing the mark; `/icon.png` + `/apple-icon.png` serve on both apps.
- `npm test && npm run build && npm run lint` green in `web/` **and** `landing/`.

## Out of scope — do NOT
- iOS asset catalog / Android launcher icons (frozen until re-skin; dark variant reserved for them).
- `WiseRate-Web/` prototype, `lux_stripe_s.png` / other Iconos_nuevos drafts.
- Any other ₱ occurrence (currency amounts), provider logos, favicon regeneration (already done).
- Renaming directories/identifiers (ROADMAP rename item, separate task).
