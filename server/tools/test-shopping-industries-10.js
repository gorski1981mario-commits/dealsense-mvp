const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { fetchMarketOffers } = require("../market-api");

function safeJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function pctl(values, pct) {
  const arr = (Array.isArray(values) ? values : []).filter((n) => Number.isFinite(n)).slice().sort((a, b) => a - b);
  if (arr.length === 0) return null;
  const p = Math.max(0, Math.min(1, pct));
  const idx = Math.floor((arr.length - 1) * p);
  return arr[idx];
}

function offerHostname(url) {
  const u = typeof url === "string" ? url.trim() : "";
  if (!u) return "";
  try {
    return new URL(u).hostname.toLowerCase();
  } catch (_) {
    return "";
  }
}

function pickOfferPreview(offers, limit = 5) {
  const list = Array.isArray(offers) ? offers : [];
  const normalized = list
    .filter((o) => o && typeof o === "object")
    .map((o) => {
      const price = typeof o.price === "number" ? o.price : Number(o.price);
      const host = offerHostname(o.url || o.product_link || o.link || "");
      return {
        seller: o.seller || null,
        domain: host ? host.replace(/^www\./, "") : null,
        price: Number.isFinite(price) ? price : null,
        reviewScore: o.reviewScore ?? null,
        reviewCount: o.reviewCount ?? null,
        title: o.title || null,
        _source: o._source || o.source || null,
      };
    })
    .sort((a, b) => {
      const pa = a.price == null ? Number.POSITIVE_INFINITY : a.price;
      const pb = b.price == null ? Number.POSITIVE_INFINITY : b.price;
      return pa - pb;
    });

  return normalized.slice(0, Math.max(0, Math.min(limit, 10)));
}

function industryQueries() {
  return [
    { industry: "elektronika", query: "usb c charger 65w" },
    { industry: "moda", query: "running shoes" },
    { industry: "dom-ogrod", query: "airfryer" },
    { industry: "zdrowie-uroda", query: "electric toothbrush" },
    { industry: "sport-fitness", query: "dumbbells set" },
    { industry: "auto-akcesoria", query: "car phone holder" },
    { industry: "zabawki-edukacja", query: "lego set" },
    { industry: "meble", query: "office chair" },
    { industry: "zwierzeta", query: "cat food 7kg" },
    { industry: "narzedzia-diy", query: "cordless drill 18v" },
  ];
}

async function runOne({ industry, query }) {
  const started = Date.now();
  let offers = null;
  let err = null;

  try {
    offers = await fetchMarketOffers(query, null);
  } catch (e) {
    offers = null;
    err = (e && e.message) || String(e);
  }

  const durationMs = Date.now() - started;
  const list = Array.isArray(offers) ? offers : [];

  const domainSet = new Set(
    list
      .map((o) => offerHostname(o && o.url ? o.url : "").replace(/^www\./, ""))
      .filter(Boolean)
  );

  return {
    industry,
    query,
    durationMs,
    offersCount: list.length,
    uniqueDomains: domainSet.size,
    error: err,
    preview: pickOfferPreview(list, 5),
  };
}

async function main() {
  const allowLive = (() => {
    const v = String(process.env.DEALSENSE_ALLOW_LIVE || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  if (!allowLive) {
    console.error("[test-shopping-industries-10] blocked: set DEALSENSE_ALLOW_LIVE=1 to run LIVE tests.");
    process.exitCode = 2;
    return;
  }

  // Force LIVE behavior
  process.env.USE_MOCK_FALLBACK = "false";

  // Keep noise down
  if (!process.env.MARKET_LOG_SILENT) process.env.MARKET_LOG_SILENT = "1";

  // Avoid cache while benchmarking provider latency
  process.env.MARKET_CACHE_BYPASS = String(process.env.MARKET_CACHE_BYPASS || "1");

  const provider = (process.env.MARKET_PROVIDER || "searchapi").trim() || "searchapi";
  process.env.MARKET_PROVIDER = provider;

  const queries = industryQueries();
  const results = [];

  for (const q of queries) {
    // sequential to avoid rate limiting
    // eslint-disable-next-line no-await-in-loop
    results.push(await runOne(q));
  }

  const durations = results.map((r) => r.durationMs).filter((n) => Number.isFinite(n));
  const ok = results.filter((r) => !r.error);
  const withOffers = results.filter((r) => (r.offersCount || 0) > 0);

  const summary = {
    provider,
    n: results.length,
    okQueries: ok.length,
    withOffers: withOffers.length,
    avgDurationMs: durations.length ? durations.reduce((s, n) => s + n, 0) / durations.length : null,
    p50DurationMs: pctl(durations, 0.5),
    p90DurationMs: pctl(durations, 0.9),
    p95DurationMs: pctl(durations, 0.95),
    maxDurationMs: durations.length ? Math.max(...durations) : null,
    totalOffers: results.reduce((s, r) => s + Number(r.offersCount || 0), 0),
    totalUniqueDomains: results.reduce((s, r) => s + Number(r.uniqueDomains || 0), 0),
  };

  const payload = {
    ts: new Date().toISOString(),
    env: {
      provider,
      useMockFallback: String(process.env.USE_MOCK_FALLBACK),
      cacheBypass: String(process.env.MARKET_CACHE_BYPASS),
    },
    summary,
    results,
  };

  const outPath = path.join(__dirname, "test-shopping-industries-10.output.json");
  fs.writeFileSync(outPath, safeJson(payload) + "\n", "utf8");

  console.log(safeJson({ summary, outPath }));
}

main().catch((err) => {
  console.error("test-shopping-industries-10 failed:", (err && err.message) || err);
  process.exitCode = 1;
});
