// One-off generator for lib/data/countries.ts — run with `node scripts/gen-countries.mjs`.
// Not part of the build; regenerate by hand if the ISO list ever needs a refresh.
const CODES = `
AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ
EC EE EG EH ER ES ET
FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY
HK HN HR HT HU
ID IE IL IM IN IO IQ IR IS IT
JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ
LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ
OM
PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA
RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG US UY UZ
VA VC VE VG VI VN VU
WF WS
YE YT
ZA ZM ZW
`
  .split(/\s+/)
  .filter(Boolean);

const en = new Intl.DisplayNames(["en"], { type: "region" });
const es = new Intl.DisplayNames(["es"], { type: "region" });

const rows = CODES.map((code) => ({
  code,
  en: en.of(code),
  es: es.of(code),
})).sort((a, b) => a.en.localeCompare(b.en));

const lines = rows.map(
  (r) => `  { code: "${r.code}", en: ${JSON.stringify(r.en)}, es: ${JSON.stringify(r.es)} },`,
);

const out = `// ISO 3166-1 alpha-2 list — docs/plan/T35-signup-ui.md "País de residencia".
// Static, committed (no npm dep). Excludes uninhabited/non-residential
// territories (Antarctica, Bouvet Island, French Southern Territories, Heard
// Island, South Georgia, US Minor Outlying Islands). Generated once via
// Intl.DisplayNames (scripts/gen-countries.mjs) — edit by hand from here on.

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  en: string;
  es: string;
}

export const COUNTRIES: Country[] = [
${lines.join("\n")}
];
`;

process.stdout.write(out);
