# Module: <Name>

**Status:** scaffolded | in-progress | shipped (iOS / Web / Android)

## Dependencies
- **Reads (services):** [exchange-rate](../services/exchange-rate.md), [persistence](../services/persistence.md), ...
- **Reads (architecture):** [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md), [localization](../architecture/localization.md)
- **Navigates to:** other [modules/](.) reachable from here
- **Future:** dependencies that will be wired later (mark with ⏳)

## Used by
- where this module is reached from — tab bar, other modules, deep links

## Purpose
One sentence — what user problem this screen solves.

## Inputs (data dependencies)
- ViewModel / state fields it reads
- Services it calls — link to [services](../services/)

## Outputs / Actions
- Navigations it triggers
- Mutations it performs (alerts created, prefs saved, etc.)

## Acceptance criteria
- 3–6 bullets. Each bullet is a user-visible behavior that can be checked.

## Platform notes
- **iOS**: `WiseRate/Features/<Name>/<Name>View.swift`
- **Web**: `web/app/.../page.tsx` (after migration from `WiseRate-Web/index.html`)
- **Android**: `android/app/src/main/java/com/wiserate/features/<name>/<Name>Screen.kt`

## Open questions
- Things blocking implementation; remove when resolved.
