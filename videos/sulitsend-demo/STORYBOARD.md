# STORYBOARD — SulitSend affiliate-reviewer walkthrough (60s, silent, 1080p)

**Message:** SulitSend is a real, live, transparent comparison site that sends high-intent EUR→PHP traffic to providers.
**Arc:** Demonstration — open on the brand, walk the product exactly as a reviewer would (live quotes → ranking → provider depth → transparency), close on the URL.
**Audience:** Affiliate-program reviewers (Partnerize/FlexOffers/Awin/CJ staff, broker partnership managers) watching an unlisted YouTube link from an application email.
**Brand voice:** Friendly-honest fintech; chartreuse winner moments; hard sticker shadows.
**Why now:** Video asset for docs/plan/afiliados-ejecucion.md §2 — linked in group-D broker pitches and follow-up emails.

**Pacing: Moderate-slow** — 6 beats, 8–11s product beats, 5–6s brand bookends. Sub-composition per beat, CSS crossfades (no shader transitions — reviewers need clarity, not spectacle).
**Format:** 1920×1080 · **Audio:** none (spec §2: no voice, text on screen; silent delivery, BGM can be added at YouTube upload if ever wanted).
**Total:** ~52s.

## Constraint acknowledged (screenshot policy)

This is a website-showcase for program reviewers: the §2 spec requires showing **the real product UI** — authenticity is the persuasion. Screenshots are therefore primary material *by design*, but every beat treats them cinematically: masked close-ups (never full-bleed static), continuous camera dollies/pans, layered caption cards in brand style, and highlight treatments. No beat is a static slide.

## Asset Audit

Contact sheet: `capture/assets/svgs/contact-sheet-1.jpg` (page 1 of 2)
1. house icon — Phosphor nav icon. SKIP all page-1 cells: they are 16–22px UI glyphs (gear, rocket, bell, chart, arrows, tag, X); too generic to carry a beat.
2. rocket icon — appears inside "Send with X" CTA; it rides along inside screenshots already.
3. trend-chart icon — represented better by the real Recharts graph in the provider screenshot.
4. bell icon — alerts feature not in the §2 shot list.
5. transfer-arrows icon — could decorate beat 1; rejected: opener is the logo build, keep it clean.

Contact sheet: `capture/assets/svgs/contact-sheet-2.jpg` (page 2 of 2)
1. tag outline — promo icon, SKIP (promos not in shot list).
2. WorldRemit round logo — SKIP as standalone (third-party mark; appears naturally inside ranking screenshots — never present provider marks as our own).
3. Moneygram round logo — SKIP, same reason.
4. Instarem round logo — SKIP, same reason.

**Brand signature visual:** the ₱ gradient logo tile + "sulitsend" wordmark is pure HTML/CSS in the app (`web/app/(tabs)/layout.tsx`) — rebuilt exactly (gradient, radius, hard shadow) rather than captured; it opens and closes the video. The winner-card chartreuse treatment (crown + `#C8F135`) is the second signature — carried by the real home screenshot in beat 2.
**Screenshots (primary material, from `capture/screenshots/pages/`):** `home.png` (beat 2), `compare.png` + `compare-full.png` (beat 3), `provider-wise.png` + `provider-wise-chart.png` (beat 4), `how-we-make-money.png` (beat 5).

## Beats

### BEAT 1 — LOGO OPENER (0:00–0:05, 5s)
- **Concept:** The brand stamps itself in one confident move; sets the pistacho-light world before the product tour.
- **Shot:** Extreme close-up → medium (logo is the subject).
- **Visual:** Full-bleed pistacho `#F2F6E4`. The ₱ tile (140px) DROPS in with back.out overshoot, its hard ink shadow LANDING a beat later (shadow offset animates 0→3px-scaled). Wordmark "sulitsend" letters SLIDE from under a mask left-to-right (staggered 40ms). Then headline "Send money to the Philippines. Compare before you send." fades-up in two lines (800, ink). Eyebrow above: "EUR → PHP · LIVE COMPARISON" (600 caps, `#5D6A45`, letter-spacing +0.08em, blur-in).
- **Camera:** slow dolly-in scale 1.0→1.06 across the whole beat.
- **Depth:** bg = flat pistacho + two soft `#E7EDD3` blobs drifting opposite directions (parallax); mid = logo lockup; fg = headline.
- **Text FX:** wordmark = mask-slide; headline = fade-up 24px, power3.out; eyebrow = blur-in.
- **Timing:** in at 0s · GSAP 5s. Crossfade 0.6s into beat 2.

### BEAT 2 — LIVE QUOTES (0:05–0:15, 10s) · caption "Live quotes from real providers"
- **Concept:** First proof: the site is live, quoting real providers at a real amount (€500).
- **Shot:** Medium → close-up on the winner card.
- **Visual:** `home.png` inside an 18px-radius card frame filling ~85% of frame, entering with a 40px rise + settle. Camera DOLLIES IN (scale 1.0→1.18) and PANS toward the chartreuse CurrencyFair winner card over 6s, ending with the crown card filling ~55% of frame. A caption bar (ink bg, pistacho text, radius 14, hard lime shadow) SNAPS in bottom-left at 1.2s: **"Live quotes from real providers"**; a secondary chip below it at 3s: "€500 → ₱ · 13 providers, refreshed every minute". At 7s a chartreuse outline ring PULSES once around the winner card region.
- **Camera:** continuous dolly + pan (power1.inOut), never static.
- **Depth:** bg = ink `#1E2A12` vignette-free field with faint oversized ₱ watermark drifting; mid = screenshot card; fg = caption chips.
- **Text FX:** caption = slide-mask from left; chip = fade-up; both hold ≥4s for readability.
- **Timing:** in at 4.4s (0.6s crossfade) · GSAP 10s.

### BEAT 3 — RANKING (0:15–0:25, 10s) · caption "Ranked by what the recipient actually gets"
- **Concept:** The ranking logic — recipient value, visible fees/markup — this is what the reviewer needs to trust.
- **Shot:** Close-up, vertical pan.
- **Visual:** `compare-full.png` (tall) in a card filling ~88% width; camera PANS DOWN the table slowly (translateY over 8s) from the BEST DEAL row through ~8 providers, scale held at 1.12. The "★ BEST DEAL" badge gets a one-time chartreuse glow sweep as it passes. Caption bar (same style, bottom-left): **"Ranked by what the recipient actually gets"**; secondary chip at 4s: "Fees, markup, speed & trust — all visible".
- **Camera:** linear-ish pan with ease-in/out shoulders; slight scale breathe 1.12→1.14.
- **Depth:** bg = pistacho field with drifting `#E7EDD3` blob; mid = table screenshot; fg = captions.
- **Text FX:** caption = slide-mask; chip = fade-up.
- **Timing:** in at 14.4s · GSAP 10s.

### BEAT 4 — PROVIDER DEPTH (0:25–0:36, 11s) · caption "Rate history and provider reviews"
- **Concept:** Not just a table — editorial depth per provider (quote, fees, pros/cons, rate trend). Two-phase beat.
- **Shot:** Medium (phase 1) → close-up on chart (phase 2).
- **Visual:** Phase 1 (0–5s): `provider-wise.png` card rises in at scale 1.08, camera drifts up slightly — Wise header + live ₱34,8xx quote visible. Caption: **"Rate history and provider reviews"**. Phase 2 (5–11s): the screenshot CROSSFADES to `provider-wise-chart.png` inside the same frame (reads as a scroll), camera dollies into the EUR→PHP rate-history chart to ~60% frame fill; a chartreuse underline DRAWS under the chart title; chip: "Live EUR→PHP trend, 7D–1Y".
- **Camera:** drift-up then dolly-in; the in-frame content swap carries the middle of the beat.
- **Depth:** bg = ink field + drifting lime hairline ring; mid = screenshot; fg = captions.
- **Text FX:** caption = slide-mask; chip = fade-up; underline = scaleX draw 0→1 power3.out.
- **Timing:** in at 24.4s · GSAP 11s.

### BEAT 5 — TRANSPARENCY (0:36–0:46, 10s) · caption "Fully transparent: commissions never affect rate or ranking"
- **Concept:** The reviewer's #1 question answered on-site: public disclosure page.
- **Shot:** Close-up on the page copy.
- **Visual:** `how-we-make-money.png` card at scale 1.25 centered on the "How we make money" H1, camera PANS DOWN to the "What this doesn't affect" paragraph; a chartreuse HIGHLIGHT SWEEPS across the sentence region "A commission never changes the rate a provider shows you, and it never affects ranking" (animated marker-style rectangle behind the text zone, 0.6s, power2.out). URL chip top-right from 2s: `app.sulitsend.com/how-we-make-money` (white chip, hard lime shadow). Caption bar: **"Fully transparent — commissions never affect rate or ranking"**.
- **Camera:** slow pan-down + micro dolly 1.25→1.3.
- **Depth:** bg = pistacho; mid = page; fg = highlight + chips.
- **Text FX:** caption = slide-mask; URL chip = pop-in back.out(1.6).
- **Timing:** in at 35.4s · GSAP 10s.

### BEAT 6 — CLOSE (0:46–0:52, 6s)
- **Concept:** Sign-off: brand + URL, mirror of the opener so the video feels sealed.
- **Shot:** Medium.
- **Visual:** Ink `#1E2A12` full-bleed. Logo lockup (tile + wordmark, pistacho text) ASSEMBLES center — tile scales in with overshoot, wordmark mask-slides. Below, the URL **app.sulitsend.com** types on in chartreuse 700 (steps easing, caret blinks twice then hides). Tagline small under it: "The EUR→PHP comparison site" (`#C6E84E`, 500). Everything breathes (±3px float) until a 0.5s fade to ink.
- **Camera:** dolly-out 1.08→1.0 as the lockup lands.
- **Depth:** bg = ink + two faint `#5D6A45` blobs drifting; mid = lockup; fg = URL.
- **Text FX:** URL = typewriter; tagline = fade-up.
- **Timing:** in at 45.4s · GSAP 6.6s. **End 52s.**

## Brand Accents Pass

| Asset | Type | Where | Role |
|---|---|---|---|
| Logo lockup (rebuilt HTML/CSS per layout.tsx) | Brand mark | Beats 1 + 6 | Opener build / closer sign-off |
| Chartreuse winner treatment (in home.png) | Signature visual | Beat 2 | The "that's them" moment — camera ends on it |
| ₱ watermark glyph | Type accent | Beats 2, 4 bg | Depth layer on ink fields, 4% opacity, slow drift |
| All captured SVG icons / provider logos | icons | SKIP | Page-1 glyphs generic; provider marks stay inside screenshots only |

## Production Architecture

```
videos/sulitsend-demo/
├── index.html                 orchestration (6 tracks, CSS crossfades)
├── DESIGN.md · STORYBOARD.md · SCRIPT.md
├── assets/fonts/outfit-latin{,-ext}.woff2
├── capture/                   (Step 0 output; screenshots/pages/*.png are the material)
└── compositions/
    ├── beat-1-opener.html
    ├── beat-2-live-quotes.html
    ├── beat-3-ranking.html
    ├── beat-4-provider.html
    ├── beat-5-transparency.html
    └── beat-6-close.html
```
