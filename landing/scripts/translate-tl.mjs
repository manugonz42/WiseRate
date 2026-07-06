// Generates lib/i18n/dictionaries/tl.ts by machine-translating the en
// dictionary with Google Translate. Output is a first draft only, see
// docs/modules/landing.md: a native Tagalog speaker must review it before
// it's treated as final copy.
//
// Usage: npm run translate:tl   (from landing/)
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { en } from "../lib/i18n/dictionaries/en.ts";
import { googleTranslate } from "./google-translate.mjs";

const PLACEHOLDER_TOKEN = "Zzholderz";

async function translateLeaf(text) {
  const protectedText = text.replaceAll("{provider}", PLACEHOLDER_TOKEN);
  const translated = await googleTranslate(protectedText, {
    from: "en",
    to: "tl",
  });
  return translated.replace(new RegExp(PLACEHOLDER_TOKEN, "i"), "{provider}");
}

async function deepTranslate(value) {
  if (typeof value === "string") {
    const translated = await translateLeaf(value);
    // Be polite to the free endpoint.
    await new Promise((resolve) => setTimeout(resolve, 120));
    process.stdout.write(".");
    return translated;
  }
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) out.push(await deepTranslate(item));
    return out;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = await deepTranslate(val);
    }
    return out;
  }
  return value;
}

function toSource(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);

  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${padIn}${toSource(v, indent + 1)}`);
    return `[\n${items.join(",\n")},\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(
      ([k, v]) => `${padIn}${k}: ${toSource(v, indent + 1)}`,
    );
    return `{\n${entries.join(",\n")},\n${pad}}`;
  }
  return JSON.stringify(value);
}

async function main() {
  console.log("Translating en -> tl via Google Translate...");
  const translated = await deepTranslate(en);
  console.log("\nDone translating.");

  const generatedAt = new Date().toISOString().slice(0, 10);
  const source = `import type { Dictionary } from "../dictionary";

// MACHINE-TRANSLATED DRAFT (en -> tl), generated ${generatedAt} by
// scripts/translate-tl.mjs (Google Translate, unofficial endpoint).
// docs/architecture/localization.md requires a native Tagalog speaker to
// review this before it's treated as final, shipped copy. Regenerate with
// \`npm run translate:tl\` after en.ts changes, then re-review.
export const tl: Dictionary = ${toSource(translated)};
`;

  const outPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../lib/i18n/dictionaries/tl.ts",
  );
  await writeFile(outPath, source, "utf-8");
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
