const fs = require("fs");
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

function pctl(values, pct) {
  const arr = (Array.isArray(values) ? values : []).filter((n) => Number.isFinite(n)).slice().sort((a, b) => a - b);
  if (arr.length === 0) return null;
  const p = Math.max(0, Math.min(1, pct));
  const idx = Math.floor((arr.length - 1) * p);
  return arr[idx];
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

function parseCsvEnv(name) {
  const raw = String(process.env[name] || "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function blockedConfig() {
  const enabled = (() => {
    const v = String(process.env.MARKET_BLOCKED_ENABLED || "1").trim().toLowerCase();
    return v !== "0" && v !== "false";
  })();

  const defaultSellers = [
    "aliexpress",
    "ali express",
    "marktplaats",
    "olx",
    "vinted",
    "ebay",
    "back market",
    "backmarket",
    "temu",
    "dhgate",
    "wish",
    "shein",
  ];

  const defaultDomains = [
    "aliexpress.com",
    "aliexpress.nl",
    "temu.com",
    "dhgate.com",
    "wish.com",
    "shein.com",
    "alibaba.com",
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

  const sellers = parseCsvEnv("MARKET_BLOCKED_SELLERS").map(normLower);
  const domains = parseCsvEnv("MARKET_BLOCKED_DOMAINS").map(normLower);

  return {
    enabled,
    blockedSellerSubstrings: Array.from(new Set([...defaultSellers, ...sellers].filter(Boolean))),
    blockedDomains: Array.from(new Set([...defaultDomains, ...domains].filter(Boolean))),
  };
}

function qualityConfig() {
  const enabled = (() => {
    const v = String(process.env.MARKET_QUALITY_FILTER_ENABLED || "1").trim().toLowerCase();
    return v !== "0" && v !== "false";
  })();

  const maxDeliveryDays = (() => {
    const raw = String(process.env.MARKET_MAX_DELIVERY_DAYS || "7").trim();
    const n = Number(raw);
    if (!Number.isFinite(n)) return 7;
    if (n <= 0) return null;
    return Math.max(1, Math.min(Math.floor(n), 30));
  })();

  const blockUsed = (() => {
    const v = String(process.env.MARKET_BLOCK_USED_ENABLED || "1").trim().toLowerCase();
    return v !== "0" && v !== "false";
  })();

  return { enabled, maxDeliveryDays, blockUsed };
}

function getDeliveryDays(offer) {
  if (!offer || typeof offer !== "object") return null;
  const v = offer.deliveryTime ?? offer.delivery_time;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function looksUsedOrMarketplace(offer, qcfg) {
  if (!qcfg || qcfg.enabled !== true) return false;
  if (!offer || typeof offer !== "object") return false;

  const txt = `${offer.title || ""} ${offer.seller || ""}`.toLowerCase();

  if (qcfg.blockUsed) {
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
    if (usedRe.some((re) => re.test(txt))) return true;
  }

  if (qcfg.maxDeliveryDays != null) {
    const d = getDeliveryDays(offer);
    if (d != null && d > qcfg.maxDeliveryDays) return true;
  }

  return false;
}

function isBlockedOffer(o, cfg) {
  if (!cfg || cfg.enabled !== true) return false;
  if (!o || typeof o !== "object") return false;

  const seller = normLower(o.seller || "");
  if (seller) {
    for (const s of cfg.blockedSellerSubstrings) {
      if (s && seller.includes(s)) return true;
    }
  }

  const host = offerHostname(o.url || o.product_link || o.link || "");
  if (host) {
    for (const d of cfg.blockedDomains) {
      if (!d) continue;
      if (host === d) return true;
      if (host.endsWith(`.${d}`)) return true;
    }
  }

  return false;
}

function analyzeDrops(rawOffers) {
  const cfg = blockedConfig();
  const qcfg = qualityConfig();
  const list = Array.isArray(rawOffers) ? rawOffers : [];

  let blocked = 0;
  let usedOrDelivery = 0;
  let kept = 0;

  for (const o of list) {
    const isBlocked = isBlockedOffer(o, cfg);
    if (isBlocked) {
      blocked += 1;
      continue;
    }

    const isUsedOrDelivery = looksUsedOrMarketplace(o, qcfg);
    if (isUsedOrDelivery) {
      usedOrDelivery += 1;
      continue;
    }

    kept += 1;
  }

  return {
    raw: list.length,
    kept,
    droppedBlocked: blocked,
    droppedUsedOrDelivery: usedOrDelivery,
  };
}

function pickOfferPreview(offers, limit = 5) {
  const list = Array.isArray(offers) ? offers : [];
  const normalized = list
    .filter((o) => o && typeof o === "object")
    .map((o) => {
      const price = typeof o.price === "number" ? o.price : Number(o.price);
      return {
        seller: o.seller || null,
        price: Number.isFinite(price) ? price : null,
        deliveryTime: o.deliveryTime ?? null,
        reviewScore: o.reviewScore ?? null,
        reviewCount: o.reviewCount ?? null,
        title: o.title || null,
        _source: o._source || null,
      };
    })
    .sort((a, b) => {
      const pa = a.price == null ? Number.POSITIVE_INFINITY : a.price;
      const pb = b.price == null ? Number.POSITIVE_INFINITY : b.price;
      return pa - pb;
    });

  return normalized.slice(0, Math.max(0, Math.min(limit, 10)));
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

function allowLive() {
  const v = String(process.env.DEALSENSE_ALLOW_LIVE || "").trim().toLowerCase();
  return v === "1" || v === "true";
}

async function runOne({ id, query }, maxResults) {
  const startedRaw = Date.now();
  let raw = null;
  let rawErr = null;
  try {
    raw = await fetchGoogleShoppingOffers(query, maxResults);
  } catch (e) {
    raw = null;
    rawErr = (e && e.message) || String(e);
  }
  const rawMs = Date.now() - startedRaw;

  const rawArr = Array.isArray(raw) ? raw : [];
  const drops = analyzeDrops(rawArr);

  const startedFiltered = Date.now();
  let filtered = null;
  let filteredErr = null;
  try {
    filtered = await fetchMarketOffers(query, null);
  } catch (e) {
    filtered = null;
    filteredErr = (e && e.message) || String(e);
  }
  const filteredMs = Date.now() - startedFiltered;

  const filteredArr = Array.isArray(filtered) ? filtered : [];

  return {
    id,
    query,
    rawMs,
    filteredMs,
    rawError: rawErr,
    filteredError: filteredErr,
    counts: {
      raw: rawArr.length,
      predictedAfterFilters: drops.kept,
      filteredRuntime: filteredArr.length,
      droppedBlocked: drops.droppedBlocked,
      droppedUsedOrDelivery: drops.droppedUsedOrDelivery,
    },
    rawPreview: pickOfferPreview(rawArr, 5),
    filteredPreview: pickOfferPreview(filteredArr, 5),
  };
}

async function main() {
  if (!allowLive()) {
    console.error("[test-fashion-10] blocked: set DEALSENSE_ALLOW_LIVE=1 to run LIVE tests.");
    process.exitCode = 2;
    return;
  }

  process.env.MARKET_PROVIDER = (process.env.MARKET_PROVIDER || "searchapi").trim() || "searchapi";
  process.env.USE_MOCK_FALLBACK = "false";
  process.env.MARKET_LOG_SILENT = "1";
  process.env.MARKET_LOG_HTTP = "1";
  process.env.MARKET_CACHE_BYPASS = "1";
  process.env.MARKET_FASHION_PROVIDER_ENABLED = "1";

  const maxResults = Math.max(1, Math.min(Number(process.env.GOOGLE_SHOPPING_NUM_RESULTS) || 80, 100));

  const queries = fashionQueries10();
  const results = [];
  for (const q of queries) {
    // sequential to avoid rate limiting
    // eslint-disable-next-line no-await-in-loop
    results.push(await runOne(q, maxResults));
  }

  const rawMsArr = results.map((r) => r.rawMs).filter((n) => Number.isFinite(n));
  const filteredMsArr = results.map((r) => r.filteredMs).filter((n) => Number.isFinite(n));

  const coverageRaw = results.filter((r) => (r.counts.raw || 0) > 0).length;
  const coverageFiltered = results.filter((r) => (r.counts.filteredRuntime || 0) > 0).length;

  const summary = {
    provider: process.env.MARKET_PROVIDER,
    n: results.length,
    coverageRaw,
    coverageFiltered,
    rawTimingMs: {
      avg: rawMsArr.length ? rawMsArr.reduce((s, n) => s + n, 0) / rawMsArr.length : null,
      p50: pctl(rawMsArr, 0.5),
      p90: pctl(rawMsArr, 0.9),
      p95: pctl(rawMsArr, 0.95),
      max: rawMsArr.length ? Math.max(...rawMsArr) : null,
    },
    filteredTimingMs: {
      avg: filteredMsArr.length ? filteredMsArr.reduce((s, n) => s + n, 0) / filteredMsArr.length : null,
      p50: pctl(filteredMsArr, 0.5),
      p90: pctl(filteredMsArr, 0.9),
      p95: pctl(filteredMsArr, 0.95),
      max: filteredMsArr.length ? Math.max(...filteredMsArr) : null,
    },
    totals: {
      rawOffers: results.reduce((s, r) => s + Number(r.counts.raw || 0), 0),
      predictedAfterFilters: results.reduce((s, r) => s + Number(r.counts.predictedAfterFilters || 0), 0),
      filteredRuntime: results.reduce((s, r) => s + Number(r.counts.filteredRuntime || 0), 0),
      droppedBlocked: results.reduce((s, r) => s + Number(r.counts.droppedBlocked || 0), 0),
      droppedUsedOrDelivery: results.reduce((s, r) => s + Number(r.counts.droppedUsedOrDelivery || 0), 0),
    },
    filterConfig: {
      MARKET_BLOCKED_ENABLED: String(process.env.MARKET_BLOCKED_ENABLED || ""),
      MARKET_QUALITY_FILTER_ENABLED: String(process.env.MARKET_QUALITY_FILTER_ENABLED || ""),
      MARKET_BLOCK_USED_ENABLED: String(process.env.MARKET_BLOCK_USED_ENABLED || ""),
      MARKET_MAX_DELIVERY_DAYS: String(process.env.MARKET_MAX_DELIVERY_DAYS || ""),
    },
  };

  const payload = {
    ts: new Date().toISOString(),
    env: {
      provider: process.env.MARKET_PROVIDER,
      useMockFallback: String(process.env.USE_MOCK_FALLBACK),
      cacheBypass: String(process.env.MARKET_CACHE_BYPASS),
    },
    summary,
    results,
  };

  const outPath = path.join(__dirname, "test-fashion-10.output.json");
  fs.writeFileSync(outPath, safeJson(payload) + "\n", "utf8");

  console.log(safeJson({ summary, outPath }));
}

main().catch((err) => {
  console.error("test-fashion-10 failed:", (err && err.message) || err);
  process.exitCode = 1;
});
