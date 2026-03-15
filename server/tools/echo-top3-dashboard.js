"use strict";

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const axios = require("axios");

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

function fmtEur(n, suffix) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "";
  const rounded = Math.round(v * 100) / 100;
  const asInt = Math.abs(rounded - Math.round(rounded)) < 1e-9;
  const num = asInt ? String(Math.round(rounded)) : rounded.toFixed(2);
  return `${num} ${suffix}`;
}

function fmtTimeFromMs(ms) {
  const n = toNum(ms);
  if (n == null || n < 0) return "";
  if (n < 1000) return "<1s";
  const s = Math.round((n / 1000) * 100) / 100;
  return `${s.toFixed(2)}s`;
}

async function detectBaseUrl() {
  const fromEnv = String(process.env.DEALSENSE_BASE_URL || "").trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const ports = String(process.env.DEALSENSE_PORTS || "4010,4000,4020,4030,4040,4050")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const p of ports) {
    const base = `http://localhost:${p}`;
    try {
      const r = await axios.get(`${base}/health`, {
        timeout: 1500,
        validateStatus: () => true,
      });
      if (r.status === 200) return base;
    } catch (_) {}
  }
  return null;
}

async function postTop3(url, payload, timeoutMs) {
  const t0 = Date.now();
  let status = null;
  let data = null;
  let error = null;
  try {
    const resp = await axios.post(url, payload, {
      timeout: timeoutMs,
      validateStatus: () => true,
      headers: { "content-type": "application/json" },
    });
    status = resp.status;
    data = resp.data;
    if (status >= 400) {
      error = (data && data.error) || `http_${status}`;
    }
  } catch (e) {
    error = (e && e.message) || String(e);
  }
  const ms = Date.now() - t0;
  return { ms, status, error, data };
}

async function postTop3WithFallback(url, product, timeoutMs) {
  const basePayload = {
    base_price: product.base_price,
    debug: true,
  };

  const queries = Array.isArray(product.queries) && product.queries.length > 0
    ? product.queries
    : [product.product_name];

  let last = null;
  for (const q of queries) {
    // eslint-disable-next-line no-await-in-loop
    const r = await postTop3(url, { ...basePayload, product_name: q }, timeoutMs);
    last = r;
    const data = r && r.data && typeof r.data === "object" ? r.data : null;
    const inputOffers = data && data.meta ? Number(data.meta.inputOffers || 0) : null;
    if (inputOffers != null && inputOffers > 0) {
      return { ...r, usedQuery: q };
    }
  }
  return { ...(last || { ms: 0, status: null, error: "no_result" }), usedQuery: queries[0] };
}

function pickOfferCell(offer, suffix) {
  if (!offer || typeof offer !== "object") return { seller: "", price: "" };
  const seller = typeof offer.seller === "string" ? offer.seller : "";
  const price = offer.price != null ? fmtEur(toNum(offer.price), suffix) : "";
  return { seller, price };
}

function renderHtml({ title, metricsRows, rows, priceSuffix, autoRefreshSeconds }) {
  const metricsTrs = metricsRows
    .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td class=\"num\">${escapeHtml(String(v ?? ""))}</td></tr>`)
    .join("");

  const productTrs = rows
    .map((r) => {
      return `<tr>
        <td>${escapeHtml(r.product)}</td>
        <td class=\"num base\">${escapeHtml(r.base)}</td>
        <td class=\"good\">${escapeHtml(r.best)}</td>
        <td class=\"warn\">${escapeHtml(r.mid)}</td>
        <td class=\"bad\">${escapeHtml(r.worst)}</td>
        <td class=\"num\">${escapeHtml(r.time)}</td>
        <td class=\"num\">${escapeHtml(r.cacheHit)}</td>
        <td class=\"num\">${escapeHtml(r.returned)}</td>
        <td class=\"num\">${escapeHtml(r.inputOffers)}</td>
        <td>${escapeHtml(r.error)}</td>
      </tr>`;
    })
    .join("\n");

  const refreshMeta = autoRefreshSeconds ? `<meta http-equiv=\"refresh\" content=\"${autoRefreshSeconds}\">` : "";

  return `<!doctype html>
<html lang=\"en\">
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    ${refreshMeta}
    <title>${escapeHtml(title)}</title>
    <style>
      :root { --bg:#ffffff; --text:#111827; --muted:#6b7280; --grid:#d1d5db; --head:#f3f4f6; }
      * { box-sizing: border-box; }
      html, body { height: auto; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      .wrap { max-width: 980px; margin: 0 auto; padding: 6px; }
      .meta { color: var(--muted); font-size: 11px; margin-bottom: 8px; }
      .bar { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom: 6px; }
      .btn { appearance:none; border:1px solid var(--grid); background: #fff; color: var(--text); font-size: 11px; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
      .btn:active { transform: translateY(1px); }
      .status { color: var(--muted); font-size: 11px; white-space: nowrap; overflow:hidden; text-overflow: ellipsis; }
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
    <div class=\"wrap\">
      <div class=\"bar\">
        <div class=\"meta\">${escapeHtml(title)} · view=simple · endpoint=/api/echo/top3 · price_suffix=${escapeHtml(priceSuffix)}</div>
        <div style=\"display:flex; gap:8px; align-items:center;\">
          <button class=\"btn\" id=\"refreshBtn\" type=\"button\">Odśwież teraz</button>
          <div class=\"status\" id=\"refreshStatus\"></div>
        </div>
      </div>

      <table id=\"metricsTable\">
        <thead>
          <tr>
            <th style=\"width: 70%\">metric</th>
            <th class=\"num\" style=\"width: 30%\">value</th>
          </tr>
        </thead>
        <tbody>
          ${metricsTrs}
        </tbody>
      </table>

      <div class=\"spacer\"></div>

      <table id=\"productsTable\">
        <thead>
          <tr>
            <th style=\"width: 22%\">product</th>
            <th class=\"num\" style=\"width: 8%\">base</th>
            <th style=\"width: 16%\">1 (best)</th>
            <th style=\"width: 16%\">2 (mid)</th>
            <th style=\"width: 16%\">3 (worst)</th>
            <th class=\"num\" style=\"width: 6%\">time</th>
            <th class=\"num\" style=\"width: 6%\">cache</th>
            <th class=\"num\" style=\"width: 6%\">ret</th>
            <th class=\"num\" style=\"width: 6%\">in</th>
            <th style=\"width: 18%\">error</th>
          </tr>
        </thead>
        <tbody>
          ${productTrs}
        </tbody>
      </table>

      <script>
        (function () {
          var btn = document.getElementById('refreshBtn');
          var st = document.getElementById('refreshStatus');
          if (!btn) return;
          function setStatus(s) { if (st) st.textContent = s || ''; }
          btn.addEventListener('click', async function () {
            try {
              btn.disabled = true;
              setStatus('refreshing...');
              var resp = await fetch('/tools/echo-top3-dashboard/refresh', { method: 'POST' });
              var txt = await resp.text();
              if (!resp.ok) {
                setStatus('refresh failed');
                btn.disabled = false;
                return;
              }
              setStatus('ok');
              // Reload to show new HTML.
              location.reload();
            } catch (e) {
              setStatus('refresh failed');
              btn.disabled = false;
            }
          });
        })();
      </script>
    </div>
  </body>
</html>`;
}

async function main() {
  const baseUrl = await detectBaseUrl();
  if (!baseUrl) {
    console.error("echo-top3-dashboard: backend not detected (no /health on known ports). Start backend first.");
    process.exitCode = 1;
    return;
  }

  const top3Url = `${baseUrl}/api/echo/top3`;
  const timeoutMs = Math.max(1000, Math.min(Number(process.env.ECHO_TIMEOUT_MS) || 15000, 60000));
  const priceSuffix = String(process.env.TEST_PRICE_SUFFIX || "€");

  const products = [
    {
      product_name: "Nike Dunk Low",
      base_price: 129,
      queries: [
        "Nike Dunk Low heren nieuw",
        "Nike Dunk Low Nederland",
        "Nike Dunk Low sneaker heren",
      ],
    },
    {
      product_name: "Dr. Martens 1460 boots",
      base_price: 189,
      queries: [
        "Dr. Martens 1460 boots nieuw",
        "Dr Martens 1460 Nederland",
        "Dr. Martens 1460 zwart 8 eye",
      ],
    },
    {
      product_name: "Patagonia Better Sweater",
      base_price: 149,
      queries: [
        "Patagonia Better Sweater heren nieuw",
        "Patagonia Better Sweater Nederland",
        "Patagonia Better Sweater fleece",
      ],
    },
    {
      product_name: "Calvin Klein underwear set",
      base_price: 49,
      queries: [
        "Calvin Klein underwear set heren nieuw",
        "Calvin Klein boxershorts multipack",
        "Calvin Klein underwear Nederland",
      ],
    },
    {
      product_name: "Polo Ralph Lauren hoodie",
      base_price: 159,
      queries: [
        "Polo Ralph Lauren hoodie heren nieuw",
        "Ralph Lauren hoodie Nederland",
        "Polo Ralph Lauren hoodie zwart",
      ],
    },
  ];

  const rows = [];
  let cacheHits = 0;
  let serverReturnsTotal = 0;
  let inputOffersTotal = 0;
  let okCount = 0;

  for (const p of products) {
    // eslint-disable-next-line no-await-in-loop
    const r = await postTop3WithFallback(top3Url, p, timeoutMs);
    const data = r && r.data && typeof r.data === "object" ? r.data : null;
    const offers = data && Array.isArray(data.offers) ? data.offers : [];

    const best = pickOfferCell(offers[0], priceSuffix);
    const mid = pickOfferCell(offers[1], priceSuffix);
    const worst = pickOfferCell(offers[2], priceSuffix);

    const cache = data && data.__cache ? data.__cache : null;
    const hit = cache && cache.hit === true;
    if (hit) cacheHits += 1;

    const returned = data && data.meta ? Number(data.meta.returnedOffers || 0) : offers.length;
    const inputOffers = data && data.meta ? Number(data.meta.inputOffers || 0) : null;

    serverReturnsTotal += Number.isFinite(returned) ? returned : 0;
    inputOffersTotal += Number.isFinite(inputOffers) ? inputOffers : 0;

    if (!r.error && r.status === 200) okCount += 1;

    rows.push({
      product: p.product_name,
      base: fmtEur(p.base_price, priceSuffix),
      best: [best.seller, best.price].filter(Boolean).join(" "),
      mid: [mid.seller, mid.price].filter(Boolean).join(" "),
      worst: [worst.seller, worst.price].filter(Boolean).join(" "),
      time: fmtTimeFromMs(r.ms),
      cacheHit: hit ? "hit" : "-",
      returned: String(Number.isFinite(returned) ? returned : ""),
      inputOffers: String(Number.isFinite(inputOffers) ? inputOffers : ""),
      error: r.error || "",
    });
  }

  const avgMs = rows.length > 0 ? rows.reduce((s, x) => s + (x.time === "" ? 0 : 0), 0) : 0;
  void avgMs;

  const metricsRows = [
    ["base_url", baseUrl],
    ["endpoint", "/api/echo/top3"],
    ["products_total", products.length],
    ["ok", okCount],
    ["cache_hits", cacheHits],
    ["server_returns_total", serverReturnsTotal],
    ["input_offers_total", inputOffersTotal],
  ];

  const title = "Dealsense Echo Top3 Dashboard";
  const autoRefreshSeconds = (() => {
    const raw = String(process.env.AUTO_REFRESH_SECONDS || "10").trim();
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.max(3, Math.min(Math.floor(n), 3600));
  })();

  const html = renderHtml({ title, metricsRows, rows, priceSuffix, autoRefreshSeconds });

  const outTools = path.join(__dirname, "echo-top3-dashboard.simple.html");
  fs.writeFileSync(outTools, html, "utf8");

  const outPublic = path.join(__dirname, "..", "public", "echo-top3-dashboard.simple.html");
  try {
    fs.writeFileSync(outPublic, html, "utf8");
  } catch (_) {}

  console.log(outTools);
  console.log(outPublic);
}

main().catch((err) => {
  console.error("echo-top3-dashboard failed:", (err && err.message) || err);
  process.exitCode = 1;
});
