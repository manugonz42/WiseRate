// One-off: mobile-viewport screenshots (390x844 @3x) for the phone-mockup demo video.
// Run from web/: node scripts/demo-shots-mobile.mjs [port]
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const port = process.argv[2] ?? "3000";
const base = `http://localhost:${port}`;
const outDir = "../videos/sulitsend-demo-mobile/capture/screenshots/mobile";
mkdirSync(outDir, { recursive: true });

const shots = [
  // Wait for a real peso quote (₱ + digits), not the header's EU→PH chip.
  { name: "home", path: "/home", waitFor: "text=/₱[0-9]/", settle: 5000 },
  { name: "compare", path: "/compare", waitFor: "text=/₱[0-9]/", settle: 5000 },
  { name: "provider-wise", path: "/provider/wise", waitFor: "text=/₱[0-9]/", settle: 4000 },
  { name: "how-we-make-money", path: "/how-we-make-money", waitFor: "h1", settle: 1500 },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: devices["iPhone 13 Pro"].userAgent,
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
  await page.waitForTimeout(s.settle);
  // Force any below-the-fold lazy content, then return to top.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  // Next.js dev-tools badge must not appear in video frames.
  await page.evaluate(() => document.querySelector("nextjs-portal")?.remove());
  await page.screenshot({ path: `${outDir}/${s.name}.png` });
  // Sticky/fixed bars freeze at their capture position in fullPage shots —
  // hide them so the -full variants read as clean scrolled content.
  await page.evaluate(() => {
    window.__hiddenSticky = [];
    for (const el of document.body.querySelectorAll("*")) {
      const pos = getComputedStyle(el).position;
      if (pos === "sticky" || pos === "fixed") {
        window.__hiddenSticky.push(el);
        el.style.visibility = "hidden";
      }
    }
  });
  await page.screenshot({ path: `${outDir}/${s.name}-full.png`, fullPage: true });
  await page.evaluate(() => {
    for (const el of window.__hiddenSticky ?? []) el.style.visibility = "";
  });
  console.log(`captured ${s.name}`);
}
await browser.close();
