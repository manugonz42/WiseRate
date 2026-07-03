// Corridor enablement harness (docs/plan/T16-corridor-expansion.md).
// For each PHP-inbound candidate, calls the live aggregator and prints the
// distinct provider count/names. Pass = >=3 distinct providers
// (docs/modules/corridors.md enablement rule). Run with:
//   npx tsx scripts/verify-corridors.ts

import { getAggregatedQuotes } from "../lib/services/quotes";

const CANDIDATES: { from: string; to: string; amount: number }[] = [
  { from: "GBP", to: "PHP", amount: 1000 },
  { from: "USD", to: "PHP", amount: 1000 },
  { from: "CAD", to: "PHP", amount: 1000 },
  { from: "AUD", to: "PHP", amount: 1000 },
];

async function main() {
  const results: { corridor: string; pass: boolean; count: number; providers: string[] }[] = [];

  for (const { from, to, amount } of CANDIDATES) {
    const corridor = `${from}->${to}`;
    process.stdout.write(`Checking ${corridor}... `);
    try {
      const { quotes } = await getAggregatedQuotes(from, to, amount);
      const providers = [...new Set(quotes.map((q) => q.providerName))].sort();
      const pass = providers.length >= 3;
      results.push({ corridor, pass, count: providers.length, providers });
      console.log(`${pass ? "PASS" : "FAIL"} — ${providers.length} providers: ${providers.join(", ") || "none"}`);
    } catch (err) {
      results.push({ corridor, pass: false, count: 0, providers: [] });
      console.log(`FAIL — error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log("\n--- Summary (paste into docs/modules/corridors.md) ---");
  const today = new Date().toISOString().slice(0, 10);
  for (const r of results) {
    console.log(`${r.corridor}: ${r.pass ? "PASS" : "FAIL"} (${r.count} providers, ${today})`);
  }
}

main();
