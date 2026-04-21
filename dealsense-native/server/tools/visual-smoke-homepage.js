const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

function ts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function main() {
  const baseUrl = process.env.E2E_BASE_URL || "http://localhost:4010";
  const outDir = path.join(__dirname, "..", "visual-smoke", ts());
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: "galaxy_360x800", width: 360, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    { name: "iphone_393x852", width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    { name: "laptop_1280x800", width: 1280, height: 800, deviceScaleFactor: 2, isMobile: false, hasTouch: false },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
    const page = await context.newPage();

    // Safety: hard-block anything payment-related.
    await page.route("**/billing/**", (route) => route.abort());
    await page.route("**/create-checkout-session", (route) => route.abort());
    await page.route("**/create-payment", (route) => route.abort());
    await page.route("**/unlock", (route) => route.abort());

    // Avoid external calls (analytics etc.) if any appear.
    await page.route("**/*", (route) => {
      const url = route.request().url();
      try {
        const u = new URL(url);
        const host = u.hostname || "";
        if (host && host !== "localhost" && host !== "127.0.0.1") return route.abort();
      } catch (_) {}
      return route.continue();
    });

    await page.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    const file = path.join(outDir, `${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: true });

    await context.close();
    console.log("Saved", file);
  }

  await browser.close();
  console.log("Visual smoke done. Output dir:", outDir);
}

main().catch((err) => {
  console.error("Visual smoke FAIL:", (err && err.message) || err);
  process.exit(1);
});
