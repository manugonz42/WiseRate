// One-off fixture capture: hits each provider's live endpoint with the exact
// request `buildRequest` builds and writes the raw JSON response under
// __fixtures__ for the parser tests to replay. Run with:
//   npx tsx scripts/capture-fixtures.mjs
// Re-run and re-commit only when a provider's response shape changes.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildRequest as buildWiseDirect } from "../lib/services/providers/wiseDirect.ts";
import { buildRequest as buildWesternUnion } from "../lib/services/providers/westernUnion.ts";
import { buildRequest as buildRemitly } from "../lib/services/providers/remitly.ts";
import { buildRequest as buildTransferGo } from "../lib/services/providers/transfergo.ts";
import { buildRequest as buildCurrencyFair } from "../lib/services/providers/currencyfair.ts";
import { buildRequest as buildWiseComparisons } from "../lib/services/wise.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(
  __dirname,
  "../lib/services/providers/__fixtures__",
);

const PROVIDERS = [
  { name: "wiseDirect", build: buildWiseDirect },
  { name: "westernUnion", build: buildWesternUnion },
  { name: "remitly", build: buildRemitly },
  { name: "transfergo", build: buildTransferGo },
  { name: "currencyfair", build: buildCurrencyFair },
  { name: "wise", build: buildWiseComparisons },
];

async function main() {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  for (const { name, build } of PROVIDERS) {
    const { url, init } = build("EUR", "PHP", 1000);
    process.stdout.write(`Fetching ${name} fixture... `);
    try {
      const res = await fetch(url, init);
      const json = await res.json();
      const dest = path.join(FIXTURES_DIR, `${name}.eur-php-1000.json`);
      fs.writeFileSync(dest, JSON.stringify(json, null, 2) + "\n");
      console.log(`ok (status ${res.status}) -> ${path.relative(process.cwd(), dest)}`);
    } catch (err) {
      console.log(`FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }
}

main();
