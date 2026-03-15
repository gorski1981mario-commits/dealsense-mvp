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

  const prices = display.map((o) => (o && typeof o.price === "number" ? o.price : null)).filter((p) => p != null);

  return {
    product: product.product_name,
    base_price: product.base_price,
    durationMs: Date.now() - started,
    marketOffers: offersList.length,
    marketError: marketErr,
    selectedOffers: display.length,
    prices,
    usedFallback15: !!(analysis && analysis.meta && analysis.meta.usedFallback15),
    usedPass: analysis && analysis.meta ? analysis.meta.usedPass : null,
    v3meta: analysis && analysis.meta ? analysis.meta : null,
    offers: display.map(pickOffer),
  };
}

async function main() {
  if (!allowLive()) {
    console.error("[test-v3-engine-10-products] blocked: set DEALSENSE_ALLOW_LIVE=1 to run LIVE tests.");
    process.exitCode = 2;
    return;
  }

  // Test-only settings
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

  const out = [];
  for (const p of products) {
    out.push(await runOne(p));
  }

  console.log(
    safeJson({
      provider: (process.env.MARKET_PROVIDER || "searchapi").trim() || "searchapi",
      cacheBypass: true,
      results: out,
    })
  );
}

main().catch((err) => {
  console.error("test-v3-engine-10-products failed:", (err && err.message) || err);
  process.exitCode = 1;
});
