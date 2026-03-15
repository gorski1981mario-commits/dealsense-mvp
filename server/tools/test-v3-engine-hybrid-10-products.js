const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { fetchMarketOffers } = require("../market-api");
const { analyzeOffersV3Strict } = require("../pricing/v3-engine");
const { analyzeOffersV2 } = require("../pricing/v2");

function allowLive() {
  const v = String(process.env.DEALSENSE_ALLOW_LIVE || "").trim().toLowerCase();
  return v === "1" || v === "true";
}

function safeJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function offerKey(o) {
  if (!o || typeof o !== "object") return "";
  const seller = typeof o.seller === "string" ? o.seller.trim().toLowerCase() : "";
  const url = typeof o.url === "string" ? o.url.trim() : "";
  const price = typeof o.price === "number" && Number.isFinite(o.price) ? o.price.toFixed(2) : "";
  return `${seller}|${url}|${price}`;
}

function dedupe(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const o of list) {
    const k = offerKey(o);
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(o);
  }
  return out;
}

function pickOffer(o) {
  if (!o || typeof o !== "object") return null;
  return {
    seller: o.seller || null,
    price: o.price ?? null,
    currency: o.currency || null,
    reviewScore: o.reviewScore ?? null,
    reviewCount: o.reviewCount ?? null,
    url: o.url || null,
    title: o.title || null,
    _source: o._source || o.source || null,
  };
}

function pctDiff(basePrice, lowest) {
  const b = typeof basePrice === "number" ? basePrice : Number(basePrice);
  const l = typeof lowest === "number" ? lowest : Number(lowest);
  if (!Number.isFinite(b) || b <= 0) return null;
  if (!Number.isFinite(l) || l <= 0) return null;
  return ((b - l) / b) * 100;
}

function round4(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.round(n * 10000) / 10000;
}

async function fetchWithProvider(provider, product) {
  const prev = process.env.MARKET_PROVIDER;
  process.env.MARKET_PROVIDER = provider;
  let offers;
  let err = null;
  const started = Date.now();
  try {
    offers = await fetchMarketOffers(product.product_name, product.ean || null);
  } catch (e) {
    offers = null;
    err = (e && e.message) || String(e);
  }
  if (prev == null) delete process.env.MARKET_PROVIDER;
  else process.env.MARKET_PROVIDER = prev;
  return {
    provider,
    durationMs: Date.now() - started,
    offers: Array.isArray(offers) ? offers : [],
    error: err,
  };
}

function analyzeByVersion(version, offers, basePrice, productName) {
  if (version === "v2") {
    const v2 = analyzeOffersV2(offers, Number(basePrice));
    return { displayOffers: v2 && Array.isArray(v2.displayOffers) ? v2.displayOffers : [], meta: v2 && v2.meta ? v2.meta : null };
  }
  const v3 = analyzeOffersV3Strict(offers, Number(basePrice), productName);
  return { displayOffers: v3 && Array.isArray(v3.displayOffers) ? v3.displayOffers : [], meta: v3 && v3.meta ? v3.meta : null };
}

async function runOne(product, version) {
  const started = Date.now();

  const a = await fetchWithProvider("searchapi", product);
  const b = await fetchWithProvider("serpapi", product);

  const merged = dedupe([...(a.offers || []), ...(b.offers || [])]);
  let analysis;
  let display;
  let meta;
  try {
    const r = analyzeByVersion(version, merged, Number(product.base_price), product.product_name);
    analysis = r;
    display = Array.isArray(r.displayOffers) ? r.displayOffers : [];
    meta = r.meta || null;
  } catch (e) {
    analysis = null;
    display = [];
    meta = { error: (e && e.message) || String(e) };
  }

  const prices = display.map((o) => (o && typeof o.price === "number" ? o.price : null)).filter((p) => p != null);
  const lowest = prices.length > 0 ? Math.min(...prices) : null;

  return {
    version,
    product: product.product_name,
    base_price: product.base_price,
    durationMs: Date.now() - started,
    providers: {
      searchapi: { offers: a.offers.length, durationMs: a.durationMs, error: a.error },
      serpapi: { offers: b.offers.length, durationMs: b.durationMs, error: b.error },
      merged: { offers: merged.length },
    },
    selectedOffers: display.length,
    prices,
    lowestSelectedPrice: lowest,
    pctDiffBaseVsLowest: pctDiff(product.base_price, lowest),
    usedFallback15: !!(meta && meta.usedFallback15),
    usedPass: meta ? meta.usedPass : null,
    vmeta: meta,
    offers: display.map(pickOffer),
  };
}

function aggregateRun(results) {
  const productsTotal = results.length;
  const withPrice1 = results.filter((r) => typeof r.lowestSelectedPrice === "number" && Number.isFinite(r.lowestSelectedPrice)).length;
  const reducedToZero = results.filter((r) => (r.selectedOffers || 0) === 0).length;
  const pctVals = results
    .map((r) => r.pctDiffBaseVsLowest)
    .filter((v) => typeof v === "number" && Number.isFinite(v));
  const coverage = productsTotal > 0 ? withPrice1 / productsTotal : 0;
  const avgPct = pctVals.length > 0 ? pctVals.reduce((s, v) => s + v, 0) / pctVals.length : null;
  const weightedPct = (() => {
    const rows = results.filter((r) => typeof r.pctDiffBaseVsLowest === "number" && Number.isFinite(r.pctDiffBaseVsLowest));
    const wsum = rows.reduce((s, r) => s + Number(r.base_price || 0), 0);
    if (wsum <= 0) return null;
    return rows.reduce((s, r) => s + (Number(r.base_price || 0) / wsum) * r.pctDiffBaseVsLowest, 0);
  })();
  return {
    products_total: productsTotal,
    products_with_price1: withPrice1,
    coverage,
    reducedToZero,
    "avg_%_diff": avgPct,
    "weighted_%_diff": weightedPct,
  };
}

function aggregatePerProduct(allRuns) {
  const by = new Map();
  for (const r of allRuns) {
    const key = r.product;
    if (!by.has(key)) {
      by.set(key, { product: key, base_price: Number(r.base_price), prices: [] });
    }
    if (typeof r.lowestSelectedPrice === "number" && Number.isFinite(r.lowestSelectedPrice)) {
      by.get(key).prices.push(r.lowestSelectedPrice);
    }
  }
  const rows = [];
  for (const v of by.values()) {
    const price1 = v.prices.length > 0 ? v.prices.reduce((s, n) => s + n, 0) / v.prices.length : null;
    rows.push({
      product: v.product,
      base_price: v.base_price,
      price_1: price1 != null ? Math.round(price1 * 100) / 100 : null,
      "%_diff": price1 != null ? round4(pctDiff(v.base_price, price1)) : null,
      runs_with_price: v.prices.length,
    });
  }
  rows.sort((a, b) => (b["%_diff"] || 0) - (a["%_diff"] || 0));
  return rows;
}

async function main() {
  if (!allowLive()) {
    console.error("[test-v3-engine-hybrid-10-products] blocked: set DEALSENSE_ALLOW_LIVE=1 to run LIVE tests.");
    process.exitCode = 2;
    return;
  }

  // test-only env
  process.env.MARKET_CACHE_BYPASS = "1";
  process.env.MARKET_LOG_SILENT = "1";

  const products = [
    { product_name: "Logitech MX Master 3S", base_price: 99 },
    { product_name: "Apple Watch Series 9", base_price: 449 },
    { product_name: "Google Pixel 8", base_price: 699 },
    { product_name: "Nintendo Switch OLED", base_price: 349 },
    { product_name: "PlayStation 5 Slim", base_price: 549 },
    { product_name: "Samsung Galaxy Tab S9", base_price: 899 },
    { product_name: "Dyson V11", base_price: 499 },
    { product_name: "Philips Airfryer XXL", base_price: 249 },
    { product_name: "DeLonghi Magnifica S", base_price: 349 },
    { product_name: "MacBook Air M2 256GB", base_price: 1099 },
  ];

  const runs = Math.max(1, Math.min(Number(process.env.TEST_RUNS) || 5, 20));
  const versions = ["v2", "v3"];

  const report = [];
  for (const version of versions) {
    const all = [];
    const summaries = [];
    for (let i = 0; i < runs; i += 1) {
      const out = [];
      for (const p of products) {
        out.push(await runOne(p, version));
      }
      all.push(...out);
      summaries.push(aggregateRun(out));
    }

    const mean = (key) => {
      const vals = summaries.map((s) => s[key]).filter((v) => typeof v === "number" && Number.isFinite(v));
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };

    report.push({
      version,
      runs,
      products_total: products.length,
      products_with_price1: mean("products_with_price1"),
      coverage: mean("coverage"),
      reducedToZero: mean("reducedToZero"),
      "avg_%_diff": mean("avg_%_diff"),
      "weighted_%_diff": mean("weighted_%_diff"),
    });

    const perProduct = aggregatePerProduct(all);
    console.log(`\n=== Pricing benchmark: ${version} (runs=${runs}) ===`);
    console.table(report.filter((r) => r.version === version));
    console.table(perProduct);
  }
}

main().catch((err) => {
  console.error("test-v3-engine-hybrid-10-products failed:", (err && err.message) || err);
  process.exitCode = 1;
});
