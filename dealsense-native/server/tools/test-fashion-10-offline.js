"use strict";

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

function safeJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function pctl(values, pct) {
  const arr = (Array.isArray(values) ? values : [])
    .filter((n) => Number.isFinite(n))
    .slice()
    .sort((a, b) => a - b);
  if (arr.length === 0) return null;
  const p = Math.max(0, Math.min(1, pct));
  const idx = Math.floor((arr.length - 1) * p);
  return arr[idx];
}

function fashionQueries10() {
  return [
    { id: "shoes_running", query: "Nike Air Zoom Pegasus 40 heren maat EU 42 Nederland nieuw" },
    { id: "shoes_sneakers", query: "Nike Air Max 90 dames maat EU 39 Nederland nieuw" },
    { id: "jeans", query: "Levi's 501 heren W32 L32 Nederland nieuw" },
    { id: "jacket_winter", query: "The North Face Thermoball dames maat M Nederland nieuw" },
    { id: "hoodie", query: "Nike Tech Fleece hoodie heren maat L Nederland nieuw" },
    { id: "dress", query: "Tommy Hilfiger jurk dames maat M Nederland nieuw" },
    { id: "tshirt", query: "adidas Originals t-shirt heren maat L Nederland nieuw" },
    { id: "kids", query: "adidas Tensaur Run 3.0 kids maat EU 30 Nederland nieuw" },
    { id: "sunglasses", query: "Ray-Ban Wayfarer zonnebril unisex Nederland nieuw" },
    { id: "underwear", query: "Calvin Klein boxer heren 3-pack maat M Nederland nieuw" },
  ];
}

async function runOne({ id, query }) {
  const started = Date.now();
  let offers = null;
  let err = null;
  try {
    const { fetchMarketOffers } = require("../market-api");
    offers = await fetchMarketOffers(query, null);
  } catch (e) {
    offers = null;
    err = (e && e.message) || String(e);
  }
  const ms = Date.now() - started;
  const arr = Array.isArray(offers) ? offers : [];
  return {
    id,
    query,
    durationMs: ms,
    offersCount: arr.length,
    error: err,
    preview: arr.slice(0, 5).map((o) => {
      const price = o && o.price != null ? Number(o.price) : null;
      return {
        seller: o ? o.seller || null : null,
        price: Number.isFinite(price) ? price : null,
        title: o ? o.title || null : null,
        _source: o ? o._source || null : null,
      };
    }),
  };
}

async function main() {
  // Force OFFLINE / mock behavior.
  process.env.USE_MOCK_FALLBACK = "true";
  process.env.MARKET_LOG_SILENT = "1";
  process.env.MARKET_LOG_HTTP = "0";
  process.env.MARKET_CACHE_BYPASS = "1";
  process.env.MARKET_FASHION_PROVIDER_ENABLED = "0";

  // Do not depend on network keys.
  delete process.env.GOOGLE_SHOPPING_API_KEY;
  delete process.env.SERPAPI_API_KEY;

  // Load market-api only after OFFLINE env is set.
  // This prevents any provider from reading stale env at module init time.
  require("../market-api");

  const queries = fashionQueries10();
  const results = [];
  for (const q of queries) {
    // sequential
    // eslint-disable-next-line no-await-in-loop
    results.push(await runOne(q));
  }

  const msArr = results.map((r) => r.durationMs).filter((n) => Number.isFinite(n));
  const withOffers = results.filter((r) => (r.offersCount || 0) > 0).length;
  const zeroOffers = results.filter((r) => (r.offersCount || 0) === 0).length;

  const summary = {
    mode: "offline_mock",
    n: results.length,
    withOffers,
    zeroOffers,
    timingMs: {
      avg: msArr.length ? msArr.reduce((s, n) => s + n, 0) / msArr.length : null,
      p50: pctl(msArr, 0.5),
      p90: pctl(msArr, 0.9),
      p95: pctl(msArr, 0.95),
      max: msArr.length ? Math.max(...msArr) : null,
    },
  };

  const payload = {
    ts: new Date().toISOString(),
    summary,
    results,
  };

  const outPath = path.join(__dirname, "test-fashion-10-offline.output.json");
  fs.writeFileSync(outPath, safeJson(payload) + "\n", "utf8");
  console.log(safeJson({ summary, outPath }));
}

main().catch((err) => {
  console.error("test-fashion-10-offline failed:", (err && err.message) || err);
  process.exitCode = 1;
});
