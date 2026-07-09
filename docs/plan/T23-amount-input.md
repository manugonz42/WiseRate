# T23 — Compare: amount input can be cleared (empty → auto 100)

## Dependencies
- **Reads:** [comparison](../modules/comparison.md), `web/app/(tabs)/compare/page.tsx`
- **Task deps:** none

## Used by
- Compare screen UX; T30 (settings default amount reuses the same input rules)

## Goal
`A_mejorar.md` item 5. Today the € amount input on `/compare` can never be emptied: `onChange` runs `Math.max(1, Number(e.target.value) || 0)`, so select-all + delete snaps back to 1. The user must be able to delete every digit; if they leave the field empty, it becomes **100** automatically.

## Pre-made decisions (binding — do not redesign)
- Keep `amount: number` as the fetch driver. Add a second state `amountInput: string` that mirrors what the user typed.
- `onChange`: accept the raw string. If it parses to an integer ≥ 1, also `setAmount(parsed)`. If it is empty or invalid, only update `amountInput` — do **not** call `setAmount`, so the last valid results stay on screen (no fetch with 0/NaN).
- `onBlur`: if `amountInput` is empty or parses to < 1, set both `amountInput = "100"` and `amount = 100`.
- Keep `type="number"`, `min={1}`, styling, and the 250 ms fetch debounce exactly as they are.
- Same pattern applies to any other **send-amount** input in `web/app` that uses the `Math.max(1, Number(...) || 0)` clamp. Find them with: grep `Math.max(1, Number` in `web/app`. As of 2026-07-09 the expected hits are `/compare` and possibly `/send/[corridor]`. Do not touch inputs that are not send-amount fields.

## Steps
1. Edit `web/app/(tabs)/compare/page.tsx`: add `amountInput` state initialised to `"1000"`; rewire the `<input>` `value`/`onChange`/`onBlur` per the decisions above.
2. Grep for other occurrences of the clamp pattern; apply the identical fix where the input is a send amount.
3. Update `docs/modules/comparison.md` acceptance criteria: "amount field can be fully cleared; blur on empty resets to €100".

## Verify
- Playwright (recipe in [README](README.md)): open `/compare`, wait for hydration, focus amount, select-all + Backspace → field shows empty, results still show previous amount; blur → field shows `100` and results reload for €100; type `250` → results update. No `NaN` anywhere on the page.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No redesign of the query bar, no new dependencies, no changes to `getQuotes`, no touching Home's fixed amount chips.
