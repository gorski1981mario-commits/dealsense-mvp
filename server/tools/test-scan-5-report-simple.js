"use strict";

const axios = require("axios");
const fs = require("fs");
const path = require("path");

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

function sortByPriceAsc(offers) {
  return (Array.isArray(offers) ? offers : [])
    .slice()
    .filter((o) => o && typeof o === "object")
    .filter((o) => toNum(o.price) != null && toNum(o.price) > 0)
    .sort((a, b) => toNum(a.price) - toNum(b.price));
}

function fmtEur(n) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "";
  const rounded = Math.round(v * 100) / 100;
  const asInt = Math.abs(rounded - Math.round(rounded)) < 1e-9;
  return asInt ? `${Math.round(rounded)} €` : `${rounded.toFixed(2)} €`;
}

function pctDiff(base, best) {
  const b = toNum(base);
  const p = toNum(best);
  if (b == null || b <= 0 || p == null || p <= 0) return null;
  return ((b - p) / b) * 100;
}

async function postScan({ url, timeoutMs, product, i }) {
  const fingerprint = `test_scan5r_${Date.now()}_${i}_${Math.random().toString(16).slice(2)}`;
  const payload = {
    base_price: product.base_price,
    product_name: product.product_name,
    availability: "in_stock",
    ean: product.ean || undefined,
    url: product.url || undefined,
    fingerprint,
  };

  const started = Date.now();
  let res;
  try {
    res = await axios.post(url, payload, {
      timeout: timeoutMs,
      headers: { "content-type": "application/json" },
      validateStatus: () => true,
    });
  } catch (err) {
    const msgParts = [];
    const msg = (err && err.message) || String(err);
    msgParts.push(msg);
    const code = err && err.code ? String(err.code) : "";
    if (code) msgParts.push(`code=${code}`);

    const agg = err && (err.errors || (err.cause && err.cause.errors));
    if (Array.isArray(agg) && agg.length > 0) {
      const top = agg
        .slice(0, 3)
        .map((e) => (e && e.message ? e.message : String(e)))
        .filter(Boolean);
      if (top.length > 0) msgParts.push(`causes=${top.join(" | ")}`);
    }

    return {
      ok: false,
      http: null,
      durationMs: Date.now() - started,
      product: product.product_name,
      base: product.base_price,
      error: msgParts.join("; "),
      offers: [],
    };
  }

  const data = res.data;
  const offers = data && typeof data === "object" ? data.offers : null;
  const sorted = sortByPriceAsc(offers);

  return {
    ok: res.status >= 200 && res.status < 300,
    http: res.status,
    durationMs: Date.now() - started,
    product: product.product_name,
    base: product.base_price,
    decision: data && typeof data === "object" ? data.decision || null : null,
    error: data && typeof data === "object" ? data.error || null : null,
    offers: sorted,
  };
}

function renderReport({ url, results }) {
  const productsTotal = results.length;

  const rows = results.map((r) => {
    const base = toNum(r.base);
    const best = r.offers && r.offers[0] ? r.offers[0] : null;
    const mid = r.offers && r.offers[1] ? r.offers[1] : null;
    const worst = r.offers && r.offers[2] ? r.offers[2] : null;

    const bestPrice = best ? toNum(best.price) : null;
    const diff = bestPrice != null ? pctDiff(base, bestPrice) : null;

    function cellClass(kind) {
      if (!kind) return "";
      if (kind === "best") return "good";
      if (kind === "mid") return "warn";
      if (kind === "worst") return "bad";
      return "";
    }

    function offerCell(o, kind) {
      if (!o) return `<td class="${cellClass(kind)}"></td>`;
      const seller = typeof o.seller === "string" ? o.seller : "";
      return `<td class="${cellClass(kind)}">${escapeHtml(seller)} ${escapeHtml(fmtEur(toNum(o.price)))}</td>`;
    }

    const diffText = diff == null ? "" : String(Math.round(diff * 100) / 100);

    const httpText = r.http == null ? "" : String(r.http);
    const decisionText = r.decision == null ? "" : String(r.decision);
    const errText = r.error == null ? "" : String(r.error);

    return `
      <tr>
        <td>${escapeHtml(r.product)}</td>
        <td class="num base">${escapeHtml(fmtEur(base))}</td>
        <td class="num">${escapeHtml(httpText)}</td>
        <td>${escapeHtml(decisionText)}</td>
        <td>${escapeHtml(errText)}</td>
        ${offerCell(best, "best")}
        ${offerCell(mid, "mid")}
        ${offerCell(worst, "worst")}
        <td class="num">${escapeHtml(diffText)}</td>
      </tr>
    `;
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dealsense Test Report (scan5)</title>
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
      <div class="meta">Dealsense Test Report · view=simple · set=scan5 · url=${escapeHtml(url)}</div>

      <table id="metricsTable">
        <thead>
          <tr>
            <th style="width: 70%">metric</th>
            <th class="num" style="width: 30%">value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>products_total</td><td class="num">${productsTotal}</td></tr>
        </tbody>
      </table>

      <div class="spacer"></div>

      <table id="productsTable">
        <thead>
          <tr>
            <th style="width: 34%">product</th>
            <th class="num" style="width: 11%">base</th>
            <th class="num" style="width: 6%">http</th>
            <th style="width: 10%">decision</th>
            <th style="width: 14%">error</th>
            <th style="width: 15%">1 (best)</th>
            <th style="width: 15%">2 (mid)</th>
            <th style="width: 15%">3 (worst)</th>
            <th class="num" style="width: 10%">%_diff</th>
          </tr>
        </thead>
        <tbody>
          ${rows.join("\n")}
        </tbody>
      </table>
    </div>
  </body>
</html>`;
}

async function main() {
  const url = process.env.SCAN_URL || "http://localhost:4000/scan";
  const timeoutMs = Number(process.env.SCAN_TIMEOUT_MS || 15000);

  const products = [
    { product_name: "Apple iPhone 13 128GB", base_price: 699 },
    { product_name: "Sony WH-1000XM5", base_price: 299 },
    { product_name: "Samsung QE55 4K TV", base_price: 799 },
    { product_name: "Bosch accuboormachine 18V", base_price: 129 },
    { product_name: "Nike Air Max 90", base_price: 149 },
  ];

  const results = [];
  for (let i = 0; i < products.length; i += 1) {
    const r = await postScan({ url, timeoutMs, product: products[i], i });
    results.push(r);
  }

  const html = renderReport({ url, results });

  const outPath = path.join(__dirname, "test-report-scan5-simple.html");
  fs.writeFileSync(outPath, html, "utf8");

  const publicPath = path.join(__dirname, "..", "public", "test-report-scan5-simple.html");
  try {
    fs.writeFileSync(publicPath, html, "utf8");
  } catch (e) {
    // ignore
  }

  console.log(outPath);
  console.log(publicPath);
}

main().catch((err) => {
  console.error("test-scan-5-report-simple failed:", (err && err.message) || err);
  process.exitCode = 1;
});
