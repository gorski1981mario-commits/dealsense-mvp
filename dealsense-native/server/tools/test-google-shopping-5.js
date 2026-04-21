const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { fetchGoogleShoppingOffers } = require("../market-api");

function safeJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj && Object.prototype.hasOwnProperty.call(obj, k) ? obj[k] : undefined;
  return out;
}

async function runOne(query) {
  query = 'Philips Airfryer XXL HD9255';
  const started = Date.now();
  let offers = null;
  let error = null;
  try {
    offers = await fetchGoogleShoppingOffers(query, Number(process.env.GOOGLE_SHOPPING_NUM_RESULTS) || 60);
  } catch (e) {
    error = (e && e.message) || String(e);
  }

  const durationMs = Date.now() - started;
  const list = Array.isArray(offers) ? offers : [];
  const first = list[0] && typeof list[0] === "object" ? list[0] : null;

  return {
    query,
    durationMs,
    offerCount: list.length,
    error,
    firstOffer: first ? pick(first, ["seller", "price", "currency", "title", "url", "reviewScore", "reviewCount", "deliveryTime", "_source"]) : null,
  };
}

async function main() {
  const queries = [
    "Apple iPhone 13 128GB",
    "Sony WH-1000XM5",
    "Samsung QE55 4K TV",
    "Bosch accuboormachine 18V",
    "Nike Air Max 90",
  ];

  const out = [];
  for (const q of queries) {
    // sequential to avoid rate limiting
    out.push(await runOne(q));
  }

  console.log(
    safeJson({
      hasGoogleShoppingAPI: !!process.env.GOOGLE_SHOPPING_API_KEY,
      provider: (process.env.MARKET_PROVIDER || "searchapi").trim() || "searchapi",
      numResults: Number(process.env.GOOGLE_SHOPPING_NUM_RESULTS) || 100,
      numPages: Number(process.env.GOOGLE_SHOPPING_NUM_PAGES) || 1,
      results: out,
    })
  );
}

main().catch((err) => {
  console.error("test-google-shopping-5 failed:", (err && err.message) || err);
  process.exitCode = 1;
});
