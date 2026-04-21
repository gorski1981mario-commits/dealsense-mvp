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

function makeSeededRng(seed) {
  let s = Number.isFinite(Number(seed)) ? Math.floor(Number(seed)) : 0;
  if (s < 0) s = -s;
  return function rand() {
    // LCG
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function shuffleWithRng(arr, rng) {
  const a = Array.isArray(arr) ? arr.slice() : [];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

function pickOffersPreview(offers, limit = 5) {
  const list = Array.isArray(offers) ? offers : [];
  const normalized = list
    .filter((o) => o && typeof o === "object")
    .map((o) => {
      const price = typeof o.price === "number" ? o.price : Number(o.price);
      return {
        seller: o.seller || null,
        price: Number.isFinite(price) ? price : null,
        reviewScore: o.reviewScore ?? null,
        reviewCount: o.reviewCount ?? null,
        url: o.url || null,
        title: o.title || null,
        _source: o._source || o.source || null,
      };
    })
    .sort((a, b) => {
      const pa = a.price == null ? Number.POSITIVE_INFINITY : a.price;
      const pb = b.price == null ? Number.POSITIVE_INFINITY : b.price;
      return pa - pb;
    });

  return normalized.slice(0, Math.max(0, Math.min(limit, 20)));
}

function normLower(s) {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
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

function isMarketplaceOrUsedOffer(offer) {
  if (!offer || typeof offer !== "object") return false;
  const seller = normLower(offer.seller || "");
  const title = normLower(offer.title || "");
  const host = offerHostname(offer.url || "");

  const blockedSellerSubstrings = [
    "aliexpress",
    "ali express",
    "temu",
    "dhgate",
    "wish",
    "shein",
    "marktplaats",
    "olx",
    "vinted",
    "ebay",
    "back market",
    "backmarket",
  ];

  const blockedDomains = [
    "aliexpress.com",
    "temu.com",
    "dhgate.com",
    "wish.com",
    "shein.com",
    "marktplaats.nl",
    "olx.pl",
    "vinted.nl",
    "vinted.pl",
    "ebay.com",
    "ebay.de",
    "ebay.nl",
    "backmarket.com",
    "backmarket.nl",
  ];

  for (const s of blockedSellerSubstrings) {
    if (s && seller.includes(s)) return true;
  }
  for (const d of blockedDomains) {
    if (!d) continue;
    if (host === d) return true;
    if (host.endsWith(`.${d}`)) return true;
  }

  const usedRe = [
    /\bused\b/i,
    /\brefurb\b/i,
    /\brefurbished\b/i,
    /\brenewed\b/i,
    /\bsecond\s*hand\b/i,
    /\btweedehands\b/i,
    /\b2e\s*hands\b/i,
    /\boutlet\b/i,
    /\bopen\s*box\b/i,
    /\bdemo\b/i,
  ];
  const txt = `${seller} ${title}`;
  if (usedRe.some((re) => re.test(txt))) return true;

  return false;
}

function filterRetailOnly(offers) {
  const list = Array.isArray(offers) ? offers : [];
  return list.filter((o) => !isMarketplaceOrUsedOffer(o));
}

async function main() {
  const allowLive = (() => {
    const v = String(process.env.DEALSENSE_ALLOW_LIVE || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  if (!allowLive) {
    console.error("[test-shopping-random-10] blocked: set DEALSENSE_ALLOW_LIVE=1 to run LIVE tests.");
    process.exitCode = 2;
    return;
  }

  // Force LIVE behavior
  process.env.USE_MOCK_FALLBACK = "false";

  const clientStore = String(process.env.CLIENT_STORE || "").trim() || "client";

  // Recommended defaults for exploratory runs
  if (!process.env.MARKET_LOG_SILENT) process.env.MARKET_LOG_SILENT = "1";

  const bypassCache = String(process.env.MARKET_CACHE_BYPASS || "1").trim();
  process.env.MARKET_CACHE_BYPASS = bypassCache;

  const provider = (process.env.MARKET_PROVIDER || "searchapi").trim() || "searchapi";
  process.env.MARKET_PROVIDER = provider;

  const N = Math.max(1, Math.min(Number(process.env.SHOPPING_RANDOM_N) || 10, 10));
  const seed = String(process.env.SHOPPING_RANDOM_SEED || Date.now());
  const rng = makeSeededRng(
    String(seed)
      .split("")
      .reduce((s, ch) => (s + ch.charCodeAt(0)) % 2147483647, 0)
  );

  // Diverse query pool (NL leaning, but mixed).
  // Keep generic enough so Shopping API returns something.
  const POOL = [
    // Electronics
    "wireless headphones",
    "bluetooth speaker",
    "powerbank 20000mah",
    "usb c charger 65w",
    "gaming mouse",
    "mechanical keyboard",
    "monitor 27 inch",
    "ssd 1tb",
    // Home
    "airfryer",
    "coffee machine",
    "vacuum cleaner",
    "kitchen scale",
    "water filter",
    "desk lamp",
    // DIY
    "cordless drill 18v",
    "screwdriver set",
    "impact driver",
    "angle grinder",
    // Sports / outdoor
    "running shoes",
    "yoga mat",
    "dumbbells set",
    "bicycle helmet",
    // Kids / toys
    "lego set",
    "nintendo switch controller",
    // Beauty
    "hair dryer",
    "electric toothbrush",
    // Pets
    "cat food 7kg",
    "dog food 12kg",
    "cat litter",
  ];

  const chosen = shuffleWithRng(POOL, rng).slice(0, Math.min(N, POOL.length));

  const results = [];
  for (const q of chosen) {
    const query = (() => {
      const s = String(clientStore || "").trim();
      if (!s || s.toLowerCase() === "client") return q;
      return `${s} ${q}`;
    })();
    const started = Date.now();
    let offers = null;
    let err = null;
    try {
      offers = await fetchMarketOffers(query, null);
    } catch (e) {
      offers = null;
      err = (e && e.message) || String(e);
    }

    const rawList = Array.isArray(offers) ? offers : [];
    const retailList = filterRetailOnly(rawList);
    const preview = pickOffersPreview(retailList, 5);

    const rawCount = rawList.length;
    const retailCount = retailList.length;
    const blockedCount = Math.max(0, rawCount - retailCount);

    const status = (() => {
      if (err) return "provider_error";
      if (rawCount === 0) return "no_offers";
      if (retailCount === 0) return "no_retail_coverage";
      return "ok";
    })();

    const visibleErr = (() => {
      if (err) return err;
      if (status === "no_retail_coverage") return `no_retail_coverage (filtered ${blockedCount}/${rawCount})`;
      return "";
    })();

    results.push({
      query,
      durationMs: Date.now() - started,
      offersCount: retailCount,
      rawOffersCount: rawCount,
      blockedOffersCount: blockedCount,
      status,
      error: visibleErr,
      preview,
    });
  }

  const summary = {
    provider,
    useMockFallback: String(process.env.USE_MOCK_FALLBACK),
    cacheBypass: String(process.env.MARKET_CACHE_BYPASS),
    n: results.length,
    okQueries: results.filter((r) => (r && r.status) !== "provider_error").length,
    withOffers: results.filter((r) => (r.offersCount || 0) > 0).length,
    totalOffers: results.reduce((s, r) => s + Number(r.offersCount || 0), 0),
    rawOffersTotal: results.reduce((s, r) => s + Number(r.rawOffersCount || 0), 0),
    blockedOffersTotal: results.reduce((s, r) => s + Number(r.blockedOffersCount || 0), 0),
    avgOffers: results.length > 0 ? results.reduce((s, r) => s + Number(r.offersCount || 0), 0) / results.length : 0,
    avgDurationMs: results.length > 0 ? results.reduce((s, r) => s + Number(r.durationMs || 0), 0) / results.length : 0,
  };

  const payload = {
    ts: new Date().toISOString(),
    seed,
    summary,
    results,
  };

  const outPath = path.join(__dirname, "test-shopping-random-10.output.json");
  fs.writeFileSync(outPath, safeJson(payload) + "\n", "utf8");

  console.log(safeJson({ summary, outPath }));
}

main().catch((err) => {
  console.error("test-shopping-random-10 failed:", (err && err.message) || err);
  process.exitCode = 1;
});
