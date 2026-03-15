const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { fetchMarketOffers } = require("../market-api");
const { analyzeOffersV3Strict } = require("../pricing/v3-engine");

function allowLive() {
  const v = String(process.env.DEALSENSE_ALLOW_LIVE || "").trim().toLowerCase();
  return v === "1" || v === "true";
}

function allowOver10Tests() {
  const v = String(process.env.DEALSENSE_ALLOW_OVER10_TESTS || "").trim().toLowerCase();
  return v === "1" || v === "true";
}

function safeJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function pctDiffBaseVsLowest(basePrice, lowestPrice) {
  const b = typeof basePrice === "number" ? basePrice : Number(basePrice);
  const l = typeof lowestPrice === "number" ? lowestPrice : Number(lowestPrice);
  if (!Number.isFinite(b) || b <= 0) return null;
  if (!Number.isFinite(l) || l <= 0) return null;
  return ((b - l) / b) * 100;
}

function pickOffer(o) {
  if (!o || typeof o !== "object") return null;
  return {
    seller: o.seller || null,
    price: o.price ?? null,
    reviewScore: o.reviewScore ?? null,
    reviewCount: o.reviewCount ?? null,
    url: o.url || null,
    title: o.title || null,
    _source: o._source || o.source || null,
  };
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

async function runOne(product) {
  const started = Date.now();
  let marketOffers;
  let marketErr = null;

  try {
    marketOffers = await fetchMarketOffers(product.product_name, product.ean || null);
  } catch (e) {
    marketOffers = null;
    marketErr = (e && e.message) || String(e);
  }

  const offersList = Array.isArray(marketOffers) ? marketOffers : [];
  const analysis = analyzeOffersV3Strict(offersList, Number(product.base_price), product.product_name);
  const display = Array.isArray(analysis.displayOffers) ? analysis.displayOffers : [];

  const lowest = display.length > 0 ? display.reduce((m, o) => (o.price < m ? o.price : m), display[0].price) : null;
  const savings = lowest != null ? Number((Number(product.base_price) - lowest).toFixed(2)) : 0;
  const pctDiff = pctDiffBaseVsLowest(Number(product.base_price), lowest);
  const usedFallback15 = !!(analysis && analysis.meta && analysis.meta.usedFallback15);

  return {
    product: product.product_name,
    base_price: product.base_price,
    durationMs: Date.now() - started,
    marketOffers: offersList.length,
    marketError: marketErr,
    selectedOffers: display.length,
    lowestSelectedPrice: lowest,
    savings,
    pctDiffBaseVsLowest: pctDiff,
    usedFallback15,
    shortfall: analysis && analysis.meta ? analysis.meta.shortfall : null,
    v3meta: analysis && analysis.meta ? analysis.meta : null,
    offers: display.map(pickOffer),
  };
}

async function main() {
  if (!allowLive()) {
    console.error("[test-v3-engine-random] blocked: set DEALSENSE_ALLOW_LIVE=1 to run LIVE tests.");
    process.exitCode = 2;
    return;
  }

  // Bypass caches for this run unless explicitly disabled
  if (!process.env.MARKET_CACHE_BYPASS) process.env.MARKET_CACHE_BYPASS = "1";
  if (!process.env.MARKET_LOG_SILENT) process.env.MARKET_LOG_SILENT = "1";

  const hardMax = allowOver10Tests() ? 50 : 10;
  const def = allowOver10Tests() ? 15 : 10;
  const N = Math.max(1, Math.min(Number(process.env.V3_RANDOM_N) || def, hardMax));

  // Mixed-category pool; base prices are intentionally rough.
  const POOL = [
    { product_name: "Apple iPhone 14 128GB", base_price: 799 },
    { product_name: "Apple iPad 10.9 64GB", base_price: 399 },
    { product_name: "Samsung Galaxy S23 128GB", base_price: 699 },
    { product_name: "Google Pixel 8", base_price: 699 },
    { product_name: "Sony WH-1000XM4", base_price: 249 },
    { product_name: "Bose QuietComfort Ultra Headphones", base_price: 399 },
    { product_name: "Nintendo Switch OLED", base_price: 349 },
    { product_name: "PlayStation 5 Slim", base_price: 549 },
    { product_name: "Xbox Series X", base_price: 549 },
    { product_name: "Dyson V11", base_price: 499 },
    { product_name: "Philips Airfryer XXL", base_price: 249 },
    { product_name: "DeLonghi Magnifica S", base_price: 349 },
    { product_name: "Bosch accuboormachine 18V", base_price: 129 },
    { product_name: "Makita boormachine 18V", base_price: 159 },
    { product_name: "LEGO Star Wars Millennium Falcon", base_price: 159 },
    { product_name: "Nike Air Max 90", base_price: 149 },
    { product_name: "Adidas Ultraboost", base_price: 179 },
    { product_name: "Herman Miller Aeron", base_price: 1299 },
    { product_name: "Logitech MX Master 3S", base_price: 99 },
    { product_name: "Samsung 55 inch QLED TV", base_price: 799 },
    { product_name: "LG OLED 55 inch", base_price: 1199 },
    { product_name: "ASUS ROG gaming laptop", base_price: 1499 },
    { product_name: "MacBook Air M2 256GB", base_price: 1099 },
    { product_name: "Lenovo ThinkPad X1 Carbon", base_price: 1799 },
  ];

  const chosen = shuffle(POOL).slice(0, Math.min(N, POOL.length));

  const out = [];
  for (const p of chosen) {
    out.push(await runOne(p));
  }

  const sum = {
    droppedInvalid: 0,
    droppedAboveOrEqualQuery: 0,
    droppedRelevanceRatio: 0,
    droppedTitleMatch: 0,
    droppedMinReviewsAbs: 0,
  };

  for (const r of out) {
    const c = r && r.v3meta && r.v3meta.counters ? r.v3meta.counters : null;
    if (!c) continue;
    sum.droppedInvalid += Number(c.droppedInvalid || 0);
    sum.droppedAboveOrEqualQuery += Number(c.droppedAboveOrEqualQuery || 0);
    sum.droppedRelevanceRatio += Number(c.droppedRelevanceRatio || 0);
    sum.droppedTitleMatch += Number(c.droppedTitleMatch || 0);
    sum.droppedMinReviewsAbs += Number(c.droppedMinReviewsAbs || 0);
  }

  const pctValues = out.map((r) => r.pctDiffBaseVsLowest).filter((v) => typeof v === "number" && Number.isFinite(v));
  const coverage = out.length > 0 ? pctValues.length / out.length : 0;
  const avgPct = pctValues.length > 0 ? pctValues.reduce((s, v) => s + v, 0) / pctValues.length : null;
  const reducedToZero = out.filter((r) => (r.selectedOffers || 0) === 0).length;
  const usedFallback15Count = out.filter((r) => r.usedFallback15 === true).length;

  console.log(
    safeJson({
      provider: (process.env.MARKET_PROVIDER || "searchapi").trim() || "searchapi",
      cacheBypass: !!process.env.MARKET_CACHE_BYPASS,
      summary: {
        products: out.length,
        coveragePctDiff: coverage,
        avgPctDiff: avgPct,
        reducedToZero,
        usedFallback15Count,
        droppedTotals: sum,
      },
      results: out,
    })
  );
}

main().catch((err) => {
  console.error("test-v3-engine-random failed:", (err && err.message) || err);
  process.exitCode = 1;
});
