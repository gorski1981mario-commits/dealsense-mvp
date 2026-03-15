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

function median(list) {
  const nums = (Array.isArray(list) ? list : [])
    .map((x) => (typeof x === "number" ? x : Number(x)))
    .filter((x) => Number.isFinite(x));
  if (nums.length === 0) return null;
  nums.sort((a, b) => a - b);
  const mid = Math.floor(nums.length / 2);
  if (nums.length % 2 === 1) return nums[mid];
  return (nums[mid - 1] + nums[mid]) / 2;
}

function summarizeFailReason(r) {
  if (!r) return "unknown";
  if (r.ok !== true) {
    if (typeof r.error === "string" && r.error) return "http_error";
    return "request_failed";
  }
  if (r.locked === true) return "locked";
  const offersLen = Array.isArray(r.offers) ? r.offers.length : 0;
  if (offersLen <= 0) return "no_offers";
  const diff = toNum(r.pctDiff);
  if (diff == null) return "no_diff";
  if (diff <= 0) return "no_savings";
  return "ok";
}

async function postScan({ url, timeoutMs, product, i }) {
  const fingerprint = `bench_scan10_${Date.now()}_${i}_${Math.random().toString(16).slice(2)}`;
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
    return {
      ok: false,
      http: null,
      durationMs: Date.now() - started,
      product: product.product_name,
      base: product.base_price,
      error: (err && err.message) || String(err),
      offers: [],
      locked: null,
      decision: null,
      pctDiff: null,
    };
  }

  const data = res.data;
  const offers = data && typeof data === "object" ? data.offers : null;
  const sorted = sortByPriceAsc(offers);
  const best = sorted && sorted[0] ? sorted[0] : null;
  const bestPrice = best ? toNum(best.price) : null;
  const diff = bestPrice != null ? pctDiff(product.base_price, bestPrice) : null;

  return {
    ok: res.status >= 200 && res.status < 300,
    http: res.status,
    durationMs: Date.now() - started,
    product: product.product_name,
    base: product.base_price,
    locked: data && typeof data === "object" ? !!data.locked : null,
    decision: data && typeof data === "object" ? data.decision || null : null,
    error: data && typeof data === "object" ? data.error || null : null,
    offers: sorted,
    pctDiff: diff,
  };
}

function renderHtmlSimple({ url, results, metricsRows }) {
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

  const metricsTrs = (Array.isArray(metricsRows) ? metricsRows : [])
    .map(([k, v]) => `<tr><td>${escapeHtml(String(k))}</td><td class="num">${escapeHtml(String(v ?? ""))}</td></tr>`)
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dealsense Benchmark (scan10)</title>
    <style>
      :root { --bg:#ffffff; --text:#111827; --muted:#6b7280; --grid:#d1d5db; --head:#f3f4f6; }
      * { box-sizing: border-box; }
      html, body { height: auto; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      .wrap { max-width: 980px; margin: 0 auto; padding: 6px; }
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
      <div class="meta">Dealsense Benchmark · view=simple · set=scan10 · url=${escapeHtml(url)}</div>

      <table id="metricsTable">
        <thead>
          <tr>
            <th style="width: 70%">metric</th>
            <th class="num" style="width: 30%">value</th>
          </tr>
        </thead>
        <tbody>
          ${metricsTrs}
        </tbody>
      </table>

      <div class="spacer"></div>

      <table id="productsTable">
        <thead>
          <tr>
            <th style="width: 30%">product</th>
            <th class="num" style="width: 10%">base</th>
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
  const timeoutMs = Number(process.env.SCAN_TIMEOUT_MS || 20000);

  const products = [
    { product_name: "Apple iPhone 13 128GB", base_price: 699 },
    { product_name: "Sony WH-1000XM5", base_price: 299 },
    { product_name: "Samsung QE55 4K TV", base_price: 799 },
    { product_name: "Anker powerbank 20000mAh", base_price: 79 },
    { product_name: "Acer Aspire laptop 15 inch", base_price: 549 },
    { product_name: "iPad tablet 10.2", base_price: 369 },
    { product_name: "Bosch accuboormachine 18V", base_price: 129 },
    { product_name: "Gamma verf muurverf 10L", base_price: 59 },
    { product_name: "Hornbach tegels badkamer 30x60", base_price: 199 },
    { product_name: "Nike Air Max 90", base_price: 149 },
  ];

  const startedAll = Date.now();
  const results = [];
  for (let i = 0; i < products.length; i += 1) {
    const r = await postScan({ url, timeoutMs, product: products[i], i });
    results.push(r);
  }
  const totalMs = Math.max(0, Date.now() - startedAll);

  const diffs = results
    .map((r) => toNum(r && r.pctDiff))
    .filter((x) => x != null);

  const positiveDiffs = diffs.filter((x) => x > 0);

  const reasons = new Map();
  for (const r of results) {
    const reason = summarizeFailReason(r);
    reasons.set(reason, (reasons.get(reason) || 0) + 1);
  }
  const topReasons = Array.from(reasons.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => `${k}:${v}`)
    .join(", ");

  const metricsRows = [
    ["products_total", results.length],
    ["hit_with_savings", positiveDiffs.length],
    ["hit_rate", results.length > 0 ? Math.round((positiveDiffs.length / results.length) * 1000) / 1000 : 0],
    ["median_savings_pct", (() => {
      const m = median(positiveDiffs);
      return m == null ? "" : Math.round(m * 100) / 100;
    })()],
    ["avg_duration_ms", results.length > 0 ? Math.round(totalMs / results.length) : ""],
    ["total_duration_ms", totalMs],
    ["top_reasons", topReasons],
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    url,
    timeoutMs,
    summary: Object.fromEntries(metricsRows.map(([k, v]) => [k, v])),
    results,
  };

  const html = renderHtmlSimple({ url, results, metricsRows });

  const outHtmlTools = path.join(__dirname, "bench-scan-10.simple.html");
  const outJsonTools = path.join(__dirname, "bench-scan-10.output.json");
  fs.writeFileSync(outHtmlTools, html, "utf8");
  fs.writeFileSync(outJsonTools, JSON.stringify(report, null, 2) + "\n", "utf8");

  const outHtmlPublic = path.join(__dirname, "..", "public", "bench-scan-10.simple.html");
  const outJsonPublic = path.join(__dirname, "..", "public", "bench-scan-10.output.json");
  try {
    fs.writeFileSync(outHtmlPublic, html, "utf8");
    fs.writeFileSync(outJsonPublic, JSON.stringify(report, null, 2) + "\n", "utf8");
  } catch (_) {
    // ignore
  }

  console.log(outHtmlTools);
  console.log(outJsonTools);
  console.log(outHtmlPublic);
  console.log(outJsonPublic);
}

main().catch((err) => {
  console.error("bench-scan-10-report-simple failed:", (err && err.message) || err);
  process.exitCode = 1;
});
