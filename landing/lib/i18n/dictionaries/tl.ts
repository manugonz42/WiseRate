import type { Dictionary } from "../dictionary";
import { en } from "./en";

// docs/architecture/localization.md: "keep tl aligned with en (no
// machine-translated strings in source, flag with comments instead)."
// This file intentionally mirrors `en` word-for-word until a native
// Tagalog speaker reviews and replaces it per module.
export const tl: Dictionary = en;
