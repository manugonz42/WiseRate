# SulitSend Docs

Source of truth for building SulitSend (working name; repo dirs keep the legacy `WiseRate` naming — see [ROADMAP](ROADMAP.md) Phase 1) across **iOS**, **Web**, and **Android**.

## How this folder works

- **One spec per module** (`modules/`, shape = `_template.md`): what it does, data in, actions out, acceptance criteria. Keep each under ~1 page — split rather than grow.
- **Specs drive code.** When a platform diverges from a spec, update the spec first, then the code.
- Cross-link with relative paths; update `MODULES.md` when status changes.

```
docs/
├── MODULES.md      # status table — every module × platform
├── ROADMAP.md      # launch phases, priorities, budget (€)
├── plan/           # Phase 1 execution record + human-only checklist
├── proveedores.md  # provider reliability research (feeds trustScore)
├── architecture/   # data model, nav, design tokens, i18n
├── platforms/      # per-platform conventions (iOS / Web / Android)
├── services/       # contracts: rate API, persistence, push, IAP, analytics
└── modules/        # one file per feature
```
