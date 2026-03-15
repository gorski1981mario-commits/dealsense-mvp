const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { fetchMarketOffers } = require("../market-api");
const { analyzeOffersV3Strict } = require("../pricing/v3-engine");

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

function getDealScoreFromSavings(savings, basePrice, offerCount) {
  const pct = basePrice > 0 ? (savings / basePrice) * 100 : 0;
  let score = 3;
  if (pct >= 15) score = 9;
  else if (pct >= 8) score = 7;
  else if (pct >= 3) score = 5;
  const n = offerCount || 0;
  const confidence = n >= 3 ? "hoog" : n >= 1 ? "medium" : "laag";
  return { dealScore: score, dealConfidence: confidence };
}

function pickOffer(o) {
  if (!o || typeof o !== "object") return null;
  return {
    seller: o.seller || null,
    price: o.price ?? null,
    currency: o.currency || null,
    reviewScore: o.reviewScore ?? null,
    reviewCount: o.reviewCount ?? null,
    deliveryTime: o.deliveryTime ?? o.delivery_time ?? null,
    url: o.url || null,
    title: o.title || null,
    _source: o._source || o.source || null,
  };
}

function pctDiffBaseVsLowest(basePrice, lowestPrice) {
  const b = typeof basePrice === "number" ? basePrice : Number(basePrice);
  const l = typeof lowestPrice === "number" ? lowestPrice : Number(lowestPrice);
  if (!Number.isFinite(b) || b <= 0) return null;
  if (!Number.isFinite(l) || l <= 0) return null;
  return ((b - l) / b) * 100;
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
  const ds = getDealScoreFromSavings(savings, Number(product.base_price), display.length);
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
    dealScore: ds.dealScore,
    dealConfidence: ds.dealConfidence,
    shortfall: analysis && analysis.meta ? analysis.meta.shortfall : null,
    v3meta: analysis && analysis.meta ? analysis.meta : null,
    offers: display.map(pickOffer),
  };
}

async function main() {
  if (!allowLive()) {
    console.error("[test-v3-engine-5] blocked: set DEALSENSE_ALLOW_LIVE=1 to run LIVE tests.");
    process.exitCode = 2;
    return;
  }

  const products = [
    { product_name: "Apple iPhone 13 128GB", base_price: 699 },
    { product_name: "Sony WH-1000XM5", base_price: 299 },
    { product_name: "Samsung QE55 4K TV", base_price: 799 },
    { product_name: "Bosch accuboormachine 18V", base_price: 129 },
    { product_name: "Nike Air Max 90", base_price: 149 },
  ];

  const out = [];
  for (const p of products) {
    out.push(await runOne(p));
  }

  const pctValues = out.map((r) => r.pctDiffBaseVsLowest).filter((v) => typeof v === "number" && Number.isFinite(v));
  const pctValuesNonZero = pctValues.filter((v) => v > 0);
  const coverage = out.length > 0 ? pctValues.length / out.length : 0;
  const avgPct = pctValues.length > 0 ? pctValues.reduce((s, v) => s + v, 0) / pctValues.length : null;
  const avgPctNonZero = pctValuesNonZero.length > 0 ? pctValuesNonZero.reduce((s, v) => s + v, 0) / pctValuesNonZero.length : null;
  const reducedToZero = out.filter((r) => (r.selectedOffers || 0) === 0).length;
  const usedFallback15Count = out.filter((r) => r.usedFallback15 === true).length;

  console.log(
    safeJson({
      hasGoogleShoppingAPI: !!process.env.GOOGLE_SHOPPING_API_KEY,
      provider: (process.env.MARKET_PROVIDER || "searchapi").trim() || "searchapi",
      summary: {
        products: out.length,
        coveragePctDiff: coverage,
        avgPctDiff: avgPct,
        avgPctDiffNonZero: avgPctNonZero,
        reducedToZero,
        usedFallback15Count,
      },
      results: out,
    })
  );
}

main().catch((err) => {
  console.error("test-v3-engine-5 failed:", (err && err.message) || err);
  process.exitCode = 1;
});
