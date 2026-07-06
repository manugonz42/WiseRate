import type { Locale } from "./config";
import type { Dictionary } from "./dictionary";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { tl } from "./dictionaries/tl";

const dictionaries: Record<Locale, Dictionary> = { en, es, tl };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
