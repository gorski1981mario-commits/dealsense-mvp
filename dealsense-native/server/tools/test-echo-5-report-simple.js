"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const express = require("express");

const { registerPackage1 } = require("../packages/package_1");
const { parseEchoTop3Input } = require("../engine/input");
const { getTop3EchoOffers } = require("../engine/offerEngine");
const { getEffectivePlanId } = require("../billing/applyPlan");

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function toNum(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmtEur(n) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "";
  const rounded = Math.round(v * 100) / 100;
  const asInt = Math.abs(rounded - Math.round(rounded)) < 1e-9;
  return asInt ? `${Math.round(rounded)} €` : `${rounded.toFixed(2)} €`;
}

function sortOffersByPriceAsc(offers) {
  return (Array.isArray(offers) ? offers : [])
    .slice()
    .filter((o) => o && typeof o === "object")
    .filter((o) => toNum(o.price) != null && toNum(o.price) > 0)
    .sort((a, b) => toNum(a.price) - toNum(b.price));
}

function pctDiff(base, best) {
  const b = toNum(base);
  const p = toNum(best);
  if (b == null || b <= 0 || p == null || p <= 0) return null;
  return ((b - p) / b) * 100;
}

function noRateLimit() {
  return (req, res, next) => next();
}

function createTestApp() {
  const app = express();
  app.use(express.json());

  const state = {
    plan: {
      id: "package_1",
      maxBasePrice: 1000,
      capabilities: { shopping: true },
    },
  };

  const deps = {
    rateLimit: noRateLimit,
    getClientIP: () => "127.0.0.1",
    getSession: async () => ({ sessionId: "test_session", data: { usageCount: 0, unlocked: true, planId: state.plan.id } }),
    isLocked: () => false,
    getEffectivePlanFromSession: () => state.plan,
    requireCapabilityOr402: ({ plan, capability, res }) => {
      const caps = (plan && plan.capabilities) || {};
      if (caps[capability] === true) return true;
      res.status(402).json({ ok: false, locked: true, error: "upgrade_required", requiredCapability: capability, planId: plan && plan.id });
      return false;
    },
    suggestUpgradePlanId: () => "package_1",
    parseEchoTop3Input,
    getTop3EchoOffers,
    getEffectivePlanId,
  };

  registerPackage1(app, deps);

  async function post(pathname, body) {
    return new Promise((resolve) => {
      const req = {
        method: "POST",
        url: pathname,
        body: body || {},
        headers: { "content-type": "application/json" },
      };

      const res = {
        _status: 200,
        status(code) {
          this._status = code;
          return this;
        },
        json(payload) {
          resolve({ status: this._status, body: payload });
        },
        setHeader() {},
        end() {
          resolve({ status: this._status, body: null });
        },
      };

      app.handle(req, res);
    });
  }

  return { state, post };
}

function renderReport({ results }) {
  const productsTotal = results.length;

  const perProduct = results.map((r) => {
    const base = toNum(r.base);
    const offers = sortOffersByPriceAsc(r.offers);
    const best = offers[0] || null;
    const mid = offers[1] || null;
    const worst = offers[2] || null;
    const bestPrice = best ? toNum(best.price) : null;
    const diff = bestPrice != null ? pctDiff(base, bestPrice) : null;
    return { r, base, offers, best, mid, worst, bestPrice, diff };
  });

  const productsWithPrice1 = perProduct.filter((x) => x.bestPrice != null).length;
  const serverReturnsTotal = perProduct.reduce((s, x) => s + (Array.isArray(x.offers) ? x.offers.length : 0), 0);
  const coverage = productsTotal > 0 ? productsWithPrice1 / productsTotal : 0;
  const reducedToZero = perProduct.filter((x) => x.bestPrice === 0).length;

  const diffs = perProduct.map((x) => x.diff).filter((v) => typeof v === "number" && Number.isFinite(v));
  const avgPctDiff = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;

  const baseSum = perProduct.map((x) => x.base).filter((v) => typeof v === "number" && Number.isFinite(v) && v > 0).reduce((a, b) => a + b, 0);
  const bestSum = perProduct
    .map((x) => ({ base: x.base, best: x.bestPrice }))
    .filter((x) => typeof x.base === "number" && Number.isFinite(x.base) && x.base > 0 && typeof x.best === "number" && Number.isFinite(x.best) && x.best > 0)
    .reduce((s, x) => s + x.best, 0);
  const weightedPctDiff = baseSum > 0 && bestSum > 0 ? ((baseSum - bestSum) / baseSum) * 100 : 0;

  function offerCell(o, kind) {
    if (!o) return `<td class="${kind}"></td>`;
    const seller = typeof o.seller === "string" ? o.seller : "";
    return `<td class="${kind}">${escapeHtml(seller)} ${escapeHtml(fmtEur(toNum(o.price)))}</td>`;
  }

  const rows = perProduct
    .map((x) => {
      const diffText = x.diff == null ? "" : String(Math.round(x.diff * 100) / 100);
      const ret = Array.isArray(x.offers) ? x.offers.length : 0;
      return `
        <tr>
          <td>${escapeHtml(x.r.product)}</td>
          <td class="num base">${escapeHtml(fmtEur(x.base))}</td>
          ${offerCell(x.best, "good")}
          ${offerCell(x.mid, "warn")}
          ${offerCell(x.worst, "bad")}
          <td class="num">${escapeHtml(diffText)}</td>
          <td class="num ret">${escapeHtml(String(ret))}</td>
        </tr>
      `;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dealsense Test Report (package_1 echo5)</title>
    <style>
      :root { --bg:#ffffff; --text:#111827; --muted:#6b7280; --grid:#d1d5db; --head:#f3f4f6; }
      * { box-sizing: border-box; }
      html, body { height: auto; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      .wrap { max-width: 760px; margin: 0 auto; padding: 6px; }
      .meta { color: var(--muted); font-size: 11px; margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      thead th { background: var(--head); font-size: 10px; font-weight: 600; color: var(--text); padding: 4px 5px; border: 1px solid var(--grid); text-align: left; }
      tbody td { font-size: 10px; padding: 2px 5px; border: 1px solid var(--grid); vertical-align: middle; }
      th { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      td { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; }
      td.base { padding-left: 4px; padding-right: 4px; }
      td.good { background: rgba(34,197,94,.12); color: #166534; }
      td.warn { background: rgba(245,158,11,.14); color: #92400e; }
      td.bad { background: rgba(239,68,68,.12); color: #991b1b; }
      .spacer { height: 8px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="meta">Dealsense Test Report · view=simple · locale=${escapeHtml(String(process.env.LOCALE || "nl"))} · set=${escapeHtml(String(process.env.PRODUCT_SET || "1"))} · package=package_1 · offline=true</div>

      <table id="metricsTable">
        <thead>
          <tr>
            <th style="width: 70%">metric</th>
            <th class="num" style="width: 30%">value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>products_total</td><td class="num">${productsTotal}</td></tr>
          <tr><td>products_with_price1</td><td class="num">${productsWithPrice1}</td></tr>
          <tr><td>server_returns_total</td><td class="num">${serverReturnsTotal}</td></tr>
          <tr><td>coverage</td><td class="num">${Math.round(coverage * 1000) / 1000}</td></tr>
          <tr><td>reducedToZero</td><td class="num">${reducedToZero}</td></tr>
          <tr><td>avg_%_diff (mean of per product %)</td><td class="num">${Math.round(avgPctDiff * 1000) / 1000}</td></tr>
          <tr><td>weighted_%_diff (sum(base-price1)/sum(base))</td><td class="num">${Math.round(weightedPctDiff * 1000) / 1000}</td></tr>
        </tbody>
      </table>

      <div class="spacer"></div>

      <table id="productsTable">
        <thead>
          <tr>
            <th style="width: 34%">product</th>
            <th class="num" style="width: 11%">base</th>
            <th style="width: 15%">1 (best)</th>
            <th style="width: 15%">2 (mid)</th>
            <th style="width: 15%">3 (worst)</th>
            <th class="num" style="width: 10%">%_diff</th>
            <th class="num" style="width: 6%">ret</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  </body>
</html>`;
}

async function main() {
  const { post } = createTestApp();

  const setId = String(process.env.PRODUCT_SET || "1").trim();

  const locale = (() => {
    const v = String(process.env.LOCALE || "nl").trim().toLowerCase();
    return v === "de" ? "de" : "nl";
  })();

  const allowNonNl = (() => {
    const v = String(process.env.ALLOW_NON_NL || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  if (locale !== "nl" && !allowNonNl) {
    throw new Error("LOCALE is locked to 'nl' for local price comparisons. Set ALLOW_NON_NL=1 to override.");
  }

  const productsNlSet1 = [
    { product_name: "Apple iPhone 13 128GB", base_price: 699 },
    { product_name: "Sony WH-1000XM5", base_price: 299 },
    { product_name: "Samsung QE55 4K TV", base_price: 799 },
    { product_name: "Bosch accuboormachine 18V", base_price: 129 },
    { product_name: "Nike Air Max 90", base_price: 149 },
  ];

  const productsNlSet2 = [
    { product_name: "Philips Airfryer XXL", base_price: 199 },
    { product_name: "Dyson Supersonic haardroger", base_price: 399 },
    { product_name: "Nintendo Switch OLED", base_price: 349 },
    { product_name: "Samsung Galaxy Tab S9", base_price: 899 },
    { product_name: "Bose QuietComfort Koptelefoon", base_price: 299 },
  ];

  const productsDeSet1 = [
    { product_name: "Apple iPhone 13 128GB", base_price: 699 },
    { product_name: "Sony WH-1000XM5", base_price: 299 },
    { product_name: "Samsung 55 Zoll 4K TV", base_price: 799 },
    { product_name: "Bosch Akku-Bohrschrauber 18V", base_price: 129 },
    { product_name: "Nike Air Max 90", base_price: 149 },
  ];

  const productsDeSet2 = [
    { product_name: "Philips Airfryer XXL", base_price: 199 },
    { product_name: "Dyson Supersonic Haartrockner", base_price: 399 },
    { product_name: "Nintendo Switch OLED", base_price: 349 },
    { product_name: "Samsung Galaxy Tab S9", base_price: 899 },
    { product_name: "Bose QuietComfort Kopfhörer", base_price: 299 },
  ];

  const products = (() => {
    if (locale === "de") {
      return setId === "2" ? productsDeSet2 : productsDeSet1;
    }
    return setId === "2" ? productsNlSet2 : productsNlSet1;
  })();

  const results = [];
  for (let i = 0; i < products.length; i += 1) {
    const p = products[i];
    let r;
    try {
      r = await post("/api/echo/top3", { base_price: p.base_price, product_name: p.product_name, debug: false });
    } catch (e) {
      r = { status: null, body: { ok: false, error: (e && e.message) || String(e) } };
    }

    const body = r && r.body && typeof r.body === "object" ? r.body : null;
    const offers = body && Array.isArray(body.offers) ? body.offers : [];

    results.push({
      product: p.product_name,
      base: p.base_price,
      http: r ? r.status : null,
      error: body && body.ok === false ? String(body.error || "") : "",
      offers,
    });

    // Minimal invariants: should not crash, and offers should be an array on 200.
    if (r && r.status === 200) {
      assert.ok(body && body.ok === true);
      assert.ok(Array.isArray(body.offers));
    }
  }

  const html = renderReport({ results });

  const outPath = path.join(__dirname, "test-report-echo5-simple.html");
  fs.writeFileSync(outPath, html, "utf8");

  const publicPath = path.join(__dirname, "..", "public", "test-report-echo5-simple.html");
  try {
    fs.writeFileSync(publicPath, html, "utf8");
  } catch (e) {
    // ignore
  }

  console.log(outPath);
  console.log(publicPath);
}

main().catch((err) => {
  console.error("test-echo-5-report-simple failed:", (err && err.message) || err);
  process.exitCode = 1;
});
