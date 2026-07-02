# WiseRate Docs

Source of truth for building WiseRate across **iOS**, **Web**, and **Android**.

## How this folder works

- **One spec per module.** Each file in `modules/` is short (~1 page) and answers: what it does, what data it needs, what actions it produces, how to know it's done.
- **Specs drive code, not the other way around.** When iOS/Web/Android diverge from a spec, update the spec first, then the code.
- **AI-friendly.** A Claude Code session can be opened on a single file under `modules/` and produce a working implementation without re-exploring the repo.

## Tree

```
docs/
├── MODULES.md              # status table — every module × platform
├── ROADMAP.md              # launch phases, priorities, budget (€)
├── architecture/           # cross-cutting decisions (data model, nav, design, i18n)
├── platforms/              # per-platform conventions (iOS / Web / Android)
├── services/               # service contracts (rate API, persistence, push, IAP, analytics)
└── modules/                # one file per feature; _template.md is the shape
```

## Status legend

- **scaffolded** — spec exists, no code yet
- **in-progress** — partial implementation, see open questions
- **shipped** — implemented + meets acceptance criteria

## Editing rules

1. Keep each module file under ~1 page. If it grows, split.
2. Cross-link with relative paths: `[notifications](../services/notifications.md)`.
3. Update `MODULES.md` status when state changes.
4. Locales supported: `en` (default), `es`, `tl` (Tagalog) — see [localization](architecture/localization.md).
