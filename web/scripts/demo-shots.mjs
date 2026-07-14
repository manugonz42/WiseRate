// One-off: 1920x1080 screenshots of the §2 shot-list pages for the demo video.
// Run from web/: node scripts/demo-shots.mjs [port]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const port = process.argv[2] ?? "3000";
const base = `http://localhost:${port}`;
const outDir = "../videos/sulitsend-demo/capture/screenshots/pages";
mkdirSync(outDir, { recursive: true });

const shots = [
  { name: "home", path: "/home", waitFor: "text=/PHP/", settle: 4000 },
  { name: "compare", path: "/compare", waitFor: "text=/PHP/", settle: 4000 },
  { name: "provider-wise", path: "/provider/wise", waitFor: "svg", settle: 3000 },
  {
    name: "provider-wise-chart",
    path: "/provider/wise",
    waitFor: "text=/rate history/",
    settle: 3000,
    scrollTo: "text=/rate history/",
  },
  { name: "how-we-make-money", path: "/how-we-make-money", waitFor: "h1", settle: 1000 },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  locale: "en-US",
});
await ctx.addInitScript(() => {
  localStorage.setItem("sulitsend.consent.v1", "denied");
  localStorage.setItem("sulitsend.defaultAmount.v1", "500");
  localStorage.setItem("sulitsend.onboarded.v1", "1");
  localStorage.setItem("sulitsend.locale.v1", "en");
});

const page = await ctx.newPage();
for (const s of shots) {
  await page.goto(base + s.path, { waitUntil: "domcontentloaded" });
  try {
    await page.waitForSelector(s.waitFor, { timeout: 20000 });
  } catch {
    console.warn(`${s.name}: waitFor "${s.waitFor}" timed out — capturing anyway`);
  }
  await page.waitForTimeout(s.settle); // let quotes/charts/animations finish
  if (s.scrollTo) {
    await page.locator(s.scrollTo).first().scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, -120); // breathing room above the section
    await page.waitForTimeout(800);
  }
  // Next.js dev-tools badge must not appear in video frames.
  await page.evaluate(() => document.querySelector("nextjs-portal")?.remove());
  await page.screenshot({ path: `${outDir}/${s.name}.png` });
  await page.screenshot({ path: `${outDir}/${s.name}-full.png`, fullPage: true });
  console.log(`captured ${s.name}`);
}
await browser.close();
