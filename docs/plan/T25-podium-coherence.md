# T25 — Home: podium shows the same data shape on all three places

## Dependencies
- **Reads:** [home](../modules/home.md), `web/app/(tabs)/home/page.tsx` (`PodiumCol`)
- **Task deps:** none

## Used by
- Home screen (mobile podium)

## Goal
`A_mejorar.md` item 8. Today each podium place shows a different data mix: 1st = "Name · fee", 2nd = "🥈 fee fee", 3rd = "🥉 Name". Unify: every place shows the **same fields in the same order**.

## Pre-made decisions (binding — exact target format)
Inside the podium bar, top to bottom, for **all three** places:
1. Receive amount (unchanged, existing sizes).
2. `{medal} {providerName}` — medals `🥇` / `🥈` / `🥉` by place. Winner keeps the bouncing 👑 above the icon **and** gets 🥇 here (the crown is decoration, the medal line is data).
3. Fee line: `€0 fee` when `q.fee === 0`, else `{eur.format(q.fee)} fee` — same `text-[10px]` styling as line 2, `text-primary` on the winner bar, `text-text-secondary` on 2nd/3rd.
- Keep unchanged: "via Wise"/"mock" source line, the winner's `+₱X EXTRA` badge, bar colors/heights, animation delays.
- `providerName` may truncate (`truncate` + `max-w-full`) so long names don't break the columns.

## Steps
1. Edit `PodiumCol` in `web/app/(tabs)/home/page.tsx`: replace the current per-place ternary copy (the `{place === 1 && ...}` block) with the uniform two lines above.
2. If `docs/modules/home.md` documents the podium copy, update it to the new format (spec first, then code, per CLAUDE.md).

## Verify
- Playwright at 390px width on `/home`: all three podium columns show amount, medal+name, fee line; winner additionally shows crown + EXTRA badge. Screenshot for the record.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- Desktop (`lg+`) Home is a different component tree (`DesktopWinner`/`DesktopRankRow`) — leave it untouched.
- No layout/size/color changes beyond the two text lines.
