const { chromium } = require("playwright");

async function main() {
  const baseUrl = process.env.E2E_BASE_URL || "http://localhost:4010";

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = { console: [], pageErrors: [] };
  page.on("console", (msg) => {
    try {
      logs.console.push({ type: msg.type(), text: msg.text() });
    } catch (_) {}
  });
  page.on("pageerror", (err) => {
    try {
      logs.pageErrors.push((err && err.message) || String(err));
    } catch (_) {}
  });

  async function dumpDebug(tag) {
    try {
      const path = `playwright-consent-gate-${tag}.png`;
      await page.screenshot({ path, fullPage: true });
      console.error("DEBUG: saved screenshot:", path);
    } catch (_) {}
    try {
      const statusText = await page.locator("#status").first().textContent().catch(() => "");
      const cardText = await page.locator("#card").first().textContent().catch(() => "");
      console.error("DEBUG: #status:", (statusText || "").trim());
      console.error("DEBUG: #card (text snippet):", (cardText || "").trim().slice(0, 300));
    } catch (_) {}
    try {
      const paywallExists = await page.locator("#paywallContainer").count().catch(() => 0);
      console.error("DEBUG: #paywallContainer count:", paywallExists);
    } catch (_) {}
    try {
      console.error("DEBUG: console logs:");
      for (const l of logs.console.slice(-50)) console.error(`- [${l.type}] ${l.text}`);
      console.error("DEBUG: page errors:");
      for (const e of logs.pageErrors.slice(-50)) console.error(`- ${e}`);
    } catch (_) {}
  }

  // Ensure consent is not pre-accepted.
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("dealsense_terms_consent_v1");
    } catch (_) {}

    try {
      window.__ds_fetch_stub = { installed: true, hits: 0, scanHits: 0, blockedHits: 0, lastPath: null };
    } catch (_) {}

    const blockedPrefixes = ["/billing/", "/create-checkout-session", "/create-payment", "/unlock"];
    const origFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : (input && typeof input.url === "string" ? input.url : "");
      const path = (() => {
        try {
          return new URL(url, window.location.origin).pathname;
        } catch (_) {
          return url;
        }
      })();

      try {
        if (window.__ds_fetch_stub) {
          window.__ds_fetch_stub.hits += 1;
          window.__ds_fetch_stub.lastPath = path;
        }
      } catch (_) {}

      if (blockedPrefixes.some((p) => path.startsWith(p))) {
        try {
          if (window.__ds_fetch_stub) window.__ds_fetch_stub.blockedHits += 1;
        } catch (_) {}
        return new Response(JSON.stringify({ ok: false, blocked: true }), {
          status: 418,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/scan") {
        try {
          if (window.__ds_fetch_stub) window.__ds_fetch_stub.scanHits += 1;
        } catch (_) {}
        const body = {
          locked: true,
          usage_count: 3,
          unlocked: false,
          unlockAllowed: true,
          unlock_fee: 0.1,
          savings: 10,
          found_price: 90,
          advisoryFraming: { title: "", body: "" },
        };
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return origFetch(input, init);
    };
  });

  // Safety: block any potentially transactional endpoints.
  await page.route("**/billing/**", (route) => route.abort());
  await page.route("**/create-checkout-session", (route) => route.abort());
  await page.route("**/create-payment", (route) => route.abort());
  await page.route("**/unlock", (route) => route.abort());

  await page.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });

  const stubInfo = await page.evaluate(() => {
    try {
      return window.__ds_fetch_stub || null;
    } catch (_) {
      return null;
    }
  });
  if (!stubInfo || stubInfo.installed !== true) {
    await dumpDebug("stub-not-installed");
    throw new Error("Fetch stub was not installed in page context.");
  }

  // Sanity-check: ensure our fetch stub is active in the page.
  const scanProbe = await page.evaluate(async () => {
    try {
      const res = await fetch("/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const txt = await res.text();
      return { ok: res.ok, status: res.status, body: txt.slice(0, 200) };
    } catch (e) {
      return { ok: false, status: 0, error: String(e) };
    }
  });
  if (!scanProbe || scanProbe.status !== 200) {
    console.error("DEBUG: scan probe failed:", JSON.stringify(scanProbe));
    await dumpDebug("scan-probe-failed");
    throw new Error("Fetch stub for /scan is not active; aborting E2E consent-gate test.");
  }

  // Fill minimal required fields to trigger scan.
  await page.fill("#price", "100");
  await page.fill("#name", "Test product");

  // Trigger scan -> should render paywall.
  await page.click("#btn", { force: true });

  // Ensure our stubbed /scan was actually hit.
  await page.waitForTimeout(250);
  const afterClickStubInfo = await page.evaluate(() => {
    try {
      return window.__ds_fetch_stub || null;
    } catch (_) {
      return null;
    }
  });
  if (!afterClickStubInfo || (afterClickStubInfo.scanHits | 0) < 1) {
    console.error("DEBUG: fetch stub not hit for /scan after click:", JSON.stringify(afterClickStubInfo));
    await dumpDebug("scan-not-hit");
    throw new Error("Scan click did not trigger stubbed /scan.");
  }

  try {
    await page.waitForSelector("#paywallContainer", { timeout: 15_000 });
    await page.waitForSelector("#termsConsent", { timeout: 5_000 });
    await page.waitForSelector("#unlockBtn", { timeout: 5_000 });
  } catch (e) {
    try {
      const statusText = await page.locator("#status").first().textContent().catch(() => "");
      const stubState = await page.evaluate(() => {
        try {
          return window.__ds_fetch_stub || null;
        } catch (_) {
          return null;
        }
      });
      console.error("DEBUG: status at failure:", (statusText || "").trim());
      console.error("DEBUG: stub state at failure:", JSON.stringify(stubState));
    } catch (_) {}
    await dumpDebug("no-paywall");
    throw e;
  }

  const unlockDisabledBefore = await page.isDisabled("#unlockBtn");
  if (unlockDisabledBefore !== true) {
    throw new Error("Expected unlockBtn to be disabled before consent is checked.");
  }

  await page.check("#termsConsent");

  // Button state updates immediately via change listener.
  const unlockDisabledAfter = await page.isDisabled("#unlockBtn");
  if (unlockDisabledAfter !== false) {
    throw new Error("Expected unlockBtn to be enabled after consent is checked.");
  }

  console.log("PASS: consent gate blocks unlock until checkbox is checked");
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", (err && err.message) || err);
  try {
    const msg = (err && err.stack) || (err && err.message) || String(err);
    console.error(msg);
  } catch (_) {}
  process.exit(1);
});
