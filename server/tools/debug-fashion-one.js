const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { fetchGoogleShoppingOffers, fetchMarketOffers } = require("../market-api");

function safeJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function allowLive() {
  const v = String(process.env.DEALSENSE_ALLOW_LIVE || "").trim().toLowerCase();
  return v === "1" || v === "true";
}

async function main() {
  if (!allowLive()) {
    console.error("[debug-fashion-one] blocked: set DEALSENSE_ALLOW_LIVE=1 to run LIVE debug.");
    process.exitCode = 2;
    return;
  }

  process.env.MARKET_PROVIDER = (process.env.MARKET_PROVIDER || "searchapi").trim() || "searchapi";
  process.env.USE_MOCK_FALLBACK = "false";
  process.env.MARKET_LOG_HTTP = "1";
  process.env.MARKET_LOG_SILENT = "1";
  process.env.MARKET_CACHE_BYPASS = "1";

  const query = String(process.env.FASHION_DEBUG_QUERY || "hardloopschoenen heren").trim();
  const maxResults = Math.max(1, Math.min(Number(process.env.GOOGLE_SHOPPING_NUM_RESULTS) || 60, 100));

  const startedA = Date.now();
  const raw = await fetchGoogleShoppingOffers(query, maxResults);
  const rawArr = Array.isArray(raw) ? raw : [];
  const tookA = Date.now() - startedA;

  const startedB = Date.now();
  const filtered = await fetchMarketOffers(query, null);
  const filteredArr = Array.isArray(filtered) ? filtered : [];
  const tookB = Date.now() - startedB;

  const out = {
    query,
    provider: process.env.MARKET_PROVIDER,
    maxResults,
    raw: {
      durationMs: tookA,
      offerCount: rawArr.length,
      sample: rawArr.slice(0, 5).map((o) => ({ seller: o.seller, price: o.price, title: o.title })),
    },
    filtered: {
      durationMs: tookB,
      offerCount: filteredArr.length,
      sample: filteredArr.slice(0, 5).map((o) => ({ seller: o.seller, price: o.price, title: o.title })),
    },
  };

  console.log(safeJson(out));
}

main().catch((e) => {
  console.error("debug-fashion-one failed:", (e && e.message) || e);
  process.exitCode = 1;
});
