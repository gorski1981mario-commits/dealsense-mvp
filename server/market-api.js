const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { fetchOffers: fetchSearchApiOffers } = require("./market/providers/searchapi");
const { fetchOffers: fetchSerpApiOffers } = require("./market/providers/serpapi");
const { fetchOffers: fetchFashionOffers } = require("./market/providers/fashion");
const { buildMockOffersForProductName } = require("./market/catalog");
const { enqueue: kwantEnqueue } = require("./kwant/queue");
const crawlerSearch = require("./crawler/search-wrapper");

/**
 * MARKET API INTEGRATION MODULE
 * Integracja z prawdziwymi źródłami danych rynkowych
 */

// ---------- USTAWIENIA CRAWLERA I API ----------
/** Czy używać własnego crawlera (true) czy zewnętrznych API (false) */
const USE_OWN_CRAWLER = (() => {
  const v = String(process.env.USE_OWN_CRAWLER || "true").trim().toLowerCase();
  return v === "1" || v === "true";
})();
/** Ile domen crawlować (dla własnego crawlera) */
const CRAWLER_MAX_DOMAINS = Number(process.env.CRAWLER_MAX_DOMAINS) || 30;

/** Ile wyników prosić z API na jedną stronę (SearchAPI.io). Więcej = więcej ofert na stronę (jeśli API zwraca). */
const GOOGLE_SHOPPING_NUM_RESULTS = Number(process.env.GOOGLE_SHOPPING_NUM_RESULTS) || 100;
/** Ile stron pobrać (page=1, 2, …). 1 = jeden request ≈ 1 s, ~30 sklepów jak wcześniej. Więcej stron = więcej ofert, ale dłużej. */
const GOOGLE_SHOPPING_NUM_PAGES = Number(process.env.GOOGLE_SHOPPING_NUM_PAGES) || 1;
/** true = najpierw sklepy niszowe (mniej recenzji), potem cena rosnąco. false = jak wcześniej (cena + popularność). */
const SORT_NICHE_SHOPS_FIRST = true;
// ----------

// Konfiguracja API (można przenieść do .env)
const GOOGLE_SHOPPING_API_KEY = process.env.GOOGLE_SHOPPING_API_KEY || "";
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY || "";
const USE_MOCK_FALLBACK = (process.env.USE_MOCK_FALLBACK || "true").trim().toLowerCase() !== "false"; // Fallback do mock danych jeśli API nie działa

// Upstash Redis (REST) cache (opcjonalny)
const UPSTASH_REDIS_REST_URL = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
const UPSTASH_REDIS_REST_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
const MARKET_CACHE_REDIS_PREFIX = (process.env.MARKET_CACHE_REDIS_PREFIX || "").trim() || "dealsense:market:";

// Prosty cache w pamięci: klucz → { ts, offers }
// Klucz preferuje EAN (dokładne dopasowanie produktu), w drugiej kolejności nazwę.
const MARKET_CACHE = new Map();
const CACHE_TTL_MS = Number(process.env.MARKET_CACHE_TTL_MS) || (6 * 60 * 60 * 1000); // 6 godzin
const CACHE_TTL_SECONDS = Math.floor(CACHE_TTL_MS / 1000);

const MARKET_INFLIGHT = new Map();
const STALE_WHILE_REVALIDATE_MS = Number(process.env.MARKET_SWR_MS) || (30 * 60 * 1000);

const PROVIDER_CONCURRENCY_ENABLED = (() => {
  const v = String(process.env.MARKET_PROVIDER_CONCURRENCY_ENABLED || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();
const PROVIDER_MAX_CONCURRENCY = (() => {
  const raw = String(process.env.MARKET_PROVIDER_MAX_CONCURRENCY || "").trim();
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n) || n <= 0) return 6;
  return Math.max(1, Math.min(Math.floor(n), 100));
})();

let PROVIDER_ACTIVE = 0;
const PROVIDER_QUEUE = [];

function providerAcquire() {
  if (!PROVIDER_CONCURRENCY_ENABLED) return Promise.resolve(() => {});
  return new Promise((resolve) => {
    const tryNow = () => {
      if (PROVIDER_ACTIVE < PROVIDER_MAX_CONCURRENCY) {
        PROVIDER_ACTIVE += 1;
        let released = false;
        resolve(() => {
          if (released) return;
          released = true;
          PROVIDER_ACTIVE = Math.max(0, PROVIDER_ACTIVE - 1);
          const next = PROVIDER_QUEUE.shift();
          if (next) next();
        });
        return;
      }
      PROVIDER_QUEUE.push(tryNow);
    };
    tryNow();
  });
}

async function withProviderSlot(fn) {
  const release = await providerAcquire();
  try {
    return await fn();
  } finally {
    try {
      release();
    } catch (_) {}
  }
}

const DISK_CACHE_ENABLED = (() => {
  const v = String(process.env.MARKET_DISK_CACHE_ENABLED || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();
const DISK_CACHE_DIR = (() => {
  const raw = String(process.env.MARKET_DISK_CACHE_DIR || "").trim();
  if (raw) return raw;
  return path.join(__dirname, ".cache", "market");
})();

const PREWARM_ENABLED = (() => {
  const v = String(process.env.MARKET_PREWARM_ENABLED || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();
const PREWARM_QUEUE_PATH = (() => {
  const raw = String(process.env.MARKET_PREWARM_QUEUE_PATH || "").trim();
  if (raw) return raw;
  return path.join(__dirname, ".cache", "prewarm-queue.jsonl");
})();

const PREWARM_SEEN = new Set();

const KWANT_CORE_ENABLED = (() => {
  const v = String(process.env.KWANT_CORE_ENABLED || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();
const KWANT_CORE_QUEUE_NAME = (() => {
  const v = String(process.env.KWANT_CORE_QUEUE_NAME || "").trim();
  return v || "default";
})();

const MARKET_METRICS_ENABLED = (() => {
  const v = String(process.env.MARKET_METRICS_ENABLED || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();

const MARKET_METRICS = {
  counters: {
    memory_hit: 0,
    disk_hit: 0,
    redis_hit: 0,
    miss: 0,
    inflight_wait: 0,
    network_fetch: 0,
    fashion_hit: 0,
    error: 0,
  },
  timingsMs: {
    fetchMarketOffers_total: [],
    network_total: [],
  },
};

function metricsInc(name) {
  if (!MARKET_METRICS_ENABLED) return;
  if (!name) return;
  if (!Object.prototype.hasOwnProperty.call(MARKET_METRICS.counters, name)) return;
  MARKET_METRICS.counters[name] += 1;
}

function metricsTiming(bucket, ms) {
  if (!MARKET_METRICS_ENABLED) return;
  if (!bucket) return;
  const arr = MARKET_METRICS.timingsMs[bucket];
  if (!Array.isArray(arr)) return;
  const n = Number(ms);
  if (!Number.isFinite(n) || n < 0) return;
  arr.push(Math.floor(n));
  if (arr.length > 200) arr.splice(0, arr.length - 200);
}

function pctl(values, pct) {
  const arr = (Array.isArray(values) ? values : []).filter((n) => Number.isFinite(n)).slice().sort((a, b) => a - b);
  if (arr.length === 0) return null;
  const p = Math.max(0, Math.min(1, pct));
  const idx = Math.floor((arr.length - 1) * p);
  return arr[idx];
}

function getMarketMetricsSnapshot() {
  const t = MARKET_METRICS.timingsMs;
  return {
    enabled: MARKET_METRICS_ENABLED,
    counters: { ...MARKET_METRICS.counters },
    timings: {
      fetchMarketOffers_total: {
        n: t.fetchMarketOffers_total.length,
        p50: pctl(t.fetchMarketOffers_total, 0.5),
        p95: pctl(t.fetchMarketOffers_total, 0.95),
        max: t.fetchMarketOffers_total.length ? Math.max(...t.fetchMarketOffers_total) : null,
      },
      network_total: {
        n: t.network_total.length,
        p50: pctl(t.network_total, 0.5),
        p95: pctl(t.network_total, 0.95),
        max: t.network_total.length ? Math.max(...t.network_total) : null,
      },
    },
  };
}

const NEGATIVE_CACHE_ENABLED = (() => {
  const v = String(process.env.MARKET_NEGATIVE_CACHE_ENABLED || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();
const NEGATIVE_CACHE_TTL_MS = Number(process.env.MARKET_NEGATIVE_CACHE_TTL_MS) || (10 * 60 * 1000);
const MARKET_NEGATIVE_CACHE = new Map();

function hpConfig() {
  const enabled = (() => {
    const v = String(process.env.MARKET_HP_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  const budgetMs = (() => {
    const raw = String(process.env.MARKET_HP_BUDGET_MS || "").trim();
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.max(500, Math.min(Math.floor(n), 30000));
  })();

  const providerTimeoutMs = (() => {
    const raw = String(process.env.MARKET_HP_PROVIDER_TIMEOUT_MS || "").trim();
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.max(500, Math.min(Math.floor(n), 15000));
  })();

  const targetOffers = (() => {
    const raw = String(process.env.MARKET_HP_TARGET_OFFERS || "").trim();
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n) || n <= 0) return 12;
    return Math.max(3, Math.min(Math.floor(n), 100));
  })();

  const maxPages = (() => {
    const raw = String(process.env.MARKET_HP_MAX_PAGES || "").trim();
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.max(1, Math.min(Math.floor(n), 5));
  })();

  const nlVariantEnabled = (() => {
    const v = String(process.env.MARKET_HP_NL_VARIANT || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  const mergeQueries = (() => {
    // Default ON when HP enabled (max expansion). Tests can disable explicitly.
    const raw = String(process.env.MARKET_HP_MERGE_QUERIES || "").trim().toLowerCase();
    if (!raw) return enabled;
    return raw === "1" || raw === "true";
  })();

  const suppressNegativeCache = (() => {
    // HP mode uses tighter budgets; avoid caching transient timeouts as "no results".
    const raw = String(process.env.MARKET_HP_SUPPRESS_NEGATIVE_CACHE || "").trim().toLowerCase();
    if (!raw) return enabled;
    return raw === "1" || raw === "true";
  })();

  return { enabled, budgetMs, providerTimeoutMs, targetOffers, maxPages, nlVariantEnabled, mergeQueries, suppressNegativeCache };
}

function withTimeout(promise, timeoutMs) {
  const t = typeof timeoutMs === "number" && Number.isFinite(timeoutMs) ? timeoutMs : null;
  if (!t) return promise;
  let id = null;
  const timer = new Promise((_, rej) => {
    id = setTimeout(() => {
      rej(new Error("hp_timeout"));
    }, t);
  });
  return Promise.race([promise, timer]).finally(() => {
    if (id) clearTimeout(id);
  });
}

function normLower(s) {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
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
    // Marketplaces / classifieds
    "marktplaats",
    "olx",
    "vinted",
    "ebay",
  ];
  const defaultDomains = [
    // Cross-border / dropship
    "aliexpress.com",
    "aliexpress.us",
    "aliexpress.ru",
    "aliexpress.nl",
    "aliexpress.de",
    "temu.com",
    "dhgate.com",
    "wish.com",
    "shein.com",
    "alibaba.com",
    // Marketplaces / classifieds
    "marktplaats.nl",
    "olx.pl",
    "vinted.nl",
    "vinted.pl",
    "ebay.com",
    "ebay.de",
    "ebay.nl",
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
    if (!Number.isFinite(n)) return 3;
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

  // Used / refurb / outlet patterns
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

  // Delivery filter: only apply when delivery is known.
  if (qcfg.maxDeliveryDays != null) {
    const d = getDeliveryDays(offer);
    if (d != null && d > qcfg.maxDeliveryDays) return true;
  }

  return false;
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

function filterBlockedOffers(list) {
  const cfg = blockedConfig();
  const qcfg = qualityConfig();
  if (!cfg.enabled && !qcfg.enabled) return Array.isArray(list) ? list : [];
  const arr = Array.isArray(list) ? list : [];
  return arr.filter((o) => !isBlockedOffer(o, cfg)).filter((o) => !looksUsedOrMarketplace(o, qcfg));
}

function nlRetailOnlyConfig() {
  const enabled = (() => {
    const v = String(process.env.MARKET_NL_RETAIL_ONLY || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  const defaultAllowedSellerSubstrings = [
    // Large NL retailers
    "bol.com",
    "coolblue",
    "mediamarkt",
    "bcc",
    "wehkamp",
    "amazon.nl",
    "alternate",
    "alternate.nl",
    "paradigit",
    "expert",
    "blokker",
    "gamma",
    "praxis",
    "karwei",
    "action",
    "hema",
    // NL marketplaces that are still retail-ish are intentionally NOT included here.
  ];

  const extra = parseCsvEnv("MARKET_NL_RETAIL_ALLOWED_SELLERS").map(normLower);
  return {
    enabled,
    allowedSellerSubstrings: Array.from(new Set([...defaultAllowedSellerSubstrings, ...extra].filter(Boolean))),
  };
}

function isLikelyNlRetailOffer(o, cfg) {
  if (!cfg || cfg.enabled !== true) return true;
  if (!o || typeof o !== "object") return false;

  const seller = normLower(o.seller || "");
  const host = offerHostname(o.url || o.product_link || o.link || "");

  // Strong heuristic: seller looks like a NL domain.
  if (seller && (seller.endsWith(".nl") || seller.includes(".nl"))) return true;

  // Strong heuristic: destination host is a NL domain (excluding google wrappers).
  if (host && host !== "www.google.com" && host !== "google.com" && (host === "nl" || host.endsWith(".nl"))) return true;

  // Allowlist by seller substring.
  for (const s of cfg.allowedSellerSubstrings) {
    if (s && seller.includes(s)) return true;
  }

  return false;
}

function filterNlRetailOnly(list) {
  const cfg = nlRetailOnlyConfig();
  if (!cfg.enabled) return Array.isArray(list) ? list : [];
  const arr = Array.isArray(list) ? list : [];
  return arr.filter((o) => isLikelyNlRetailOffer(o, cfg));
}

function isUpstashEnabled() {
  return !!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
}

function upstashUrl(pathname) {
  const base = UPSTASH_REDIS_REST_URL.replace(/\/+$/, "");
  const p = String(pathname || "").replace(/^\/+/, "");
  return `${base}/${p}`;
}

async function upstashGet(pathname, timeoutMs = 2000) {
  if (!isUpstashEnabled()) return null;
  try {
    const url = upstashUrl(pathname);
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      timeout: timeoutMs,
      validateStatus: () => true,
    });
    return resp && resp.data ? resp.data.result : null;
  } catch (_) {
    return null;
  }
}

function upstashPost(pathname) {
  if (!isUpstashEnabled()) return;
  const url = upstashUrl(pathname);
  void axios
    .post(url, null, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      timeout: 1500,
      validateStatus: () => true,
    })
    .catch(() => {});
}

function redisCacheKey(cacheKey) {
  if (!cacheKey) return null;
  return `${MARKET_CACHE_REDIS_PREFIX}${cacheKey}`;
}

function diskCachePath(cacheKey) {
  if (!cacheKey) return null;
  const safe = Buffer.from(String(cacheKey), "utf8").toString("base64").replace(/[^a-z0-9_-]/gi, "_");
  return path.join(DISK_CACHE_DIR, `${safe}.json`);
}

function ensureDiskCacheDir() {
  if (!DISK_CACHE_ENABLED) return;
  try {
    fs.mkdirSync(DISK_CACHE_DIR, { recursive: true });
  } catch (_) {}
}

function enqueuePrewarm(payload) {
  if (!PREWARM_ENABLED) return;
  try {
    const k = payload && payload.cacheKey ? String(payload.cacheKey) : "";
    if (k) {
      if (PREWARM_SEEN.has(k)) return;
      PREWARM_SEEN.add(k);
    }
    const dir = path.dirname(PREWARM_QUEUE_PATH);
    fs.mkdirSync(dir, { recursive: true });
    const line = JSON.stringify({ ts: new Date().toISOString(), ...payload }) + "\n";
    fs.appendFileSync(PREWARM_QUEUE_PATH, line, "utf8");
  } catch (_) {}
}

function enqueueKwantCorePrewarm(payload) {
  if (!KWANT_CORE_ENABLED) return;
  try {
    const p = payload && typeof payload === "object" ? payload : {};
    const cacheKey = p.cacheKey ? String(p.cacheKey) : "";
    const q = p.q ? String(p.q) : "";
    const ean = p.ean ? String(p.ean) : "";
    if (!cacheKey) return;

    void kwantEnqueue(
      {
        queue: KWANT_CORE_QUEUE_NAME,
        taskType: "market_prewarm",
        engine: "server",
        dedupKey: `market_prewarm|${cacheKey}`,
        payload: { cacheKey, q: q || null, ean: ean || null },
        priority: 5,
      },
      { dedupTtlSeconds: Math.max(60, Math.min(CACHE_TTL_SECONDS, 60 * 60 * 24)) }
    ).catch(() => {});
  } catch (_) {}
}

 function enqueueKwantHybridKickoff(payload) {
  const enabled = (() => {
    const v = String(process.env.MARKET_KWANT_HYBRID_FALLBACK_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return;

  try {
    const p = payload && typeof payload === "object" ? payload : {};
    const cacheKey = p.cacheKey ? String(p.cacheKey) : "";
    const q = p.q ? String(p.q) : "";
    const ean = p.ean ? String(p.ean) : "";
    if (!cacheKey || !ean) return;

    void kwantEnqueue(
      {
        queue: KWANT_CORE_QUEUE_NAME,
        taskType: "hybrid_kickoff",
        engine: "server",
        dedupKey: `hybrid_kickoff|${cacheKey}`,
        payload: { query: q || null, ean: ean || null, queue: KWANT_CORE_QUEUE_NAME },
        priority: 6,
      },
      { dedupTtlSeconds: Math.max(60, Math.min(CACHE_TTL_SECONDS, 60 * 60 * 24)) }
    ).catch(() => {});
  } catch (_) {}
 }

function getFromDiskCache(cacheKey) {
  if (!DISK_CACHE_ENABLED) return null;
  const p = diskCachePath(cacheKey);
  if (!p) return null;
  try {
    const raw = fs.readFileSync(p, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.ts || !Array.isArray(parsed.offers)) return null;
    const isExpired = Date.now() - parsed.ts > CACHE_TTL_MS;
    if (isExpired) return null;
    return parsed.offers;
  } catch (_) {
    return null;
  }
}

function setDiskCache(cacheKey, offers) {
  if (!DISK_CACHE_ENABLED) return;
  const p = diskCachePath(cacheKey);
  if (!p) return;
  if (!Array.isArray(offers) || offers.length === 0) return;
  try {
    ensureDiskCacheDir();
    const tmp = `${p}.tmp`;
    const payload = JSON.stringify({ ts: Date.now(), offers });
    fs.writeFileSync(tmp, payload, "utf8");
    fs.renameSync(tmp, p);
  } catch (_) {}
}

async function getFromRedisCache(cacheKey) {
  const key = redisCacheKey(cacheKey);
  if (!key) return null;
  const raw = await upstashGet(`get/${encodeURIComponent(key)}`, 2000);
  if (!raw || typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (_) {
    return null;
  }
}

function setRedisCache(cacheKey, offers) {
  const key = redisCacheKey(cacheKey);
  if (!key) return;
  if (!Array.isArray(offers) || offers.length === 0) return;
  try {
    const payload = JSON.stringify(offers);
    const k = encodeURIComponent(key);
    const ttl = Math.max(60, Math.min(CACHE_TTL_SECONDS, 60 * 60 * 24 * 30));
    const v = encodeURIComponent(payload);
    upstashPost(`setex/${k}/${ttl}/${v}`);
  } catch (_) {}
}

function getCacheKey(productName, ean) {
  if (ean) {
    const eanStr = String(ean).trim();
    // Akceptujemy typowe długości EAN (8–14 cyfr)
    if (/^\d{8,14}$/.test(eanStr)) {
      return `ean:${eanStr}`;
    }
  }

  const name = (productName || "").trim().toLowerCase();
  if (!name) return null;
  return `name:${name}`;
}

function getFromCache(cacheKey) {
  if (!cacheKey) return null;

  if (NEGATIVE_CACHE_ENABLED) {
    const neg = MARKET_NEGATIVE_CACHE.get(cacheKey);
    if (neg && neg.ts && Date.now() - neg.ts < NEGATIVE_CACHE_TTL_MS) {
      return [];
    }
    if (neg && neg.ts && Date.now() - neg.ts >= NEGATIVE_CACHE_TTL_MS) {
      MARKET_NEGATIVE_CACHE.delete(cacheKey);
    }
  }

  const entry = MARKET_CACHE.get(cacheKey);
  if (!entry) return null;

  const isExpired = Date.now() - entry.ts > CACHE_TTL_MS;
  if (isExpired) {
    MARKET_CACHE.delete(cacheKey);
    return null;
  }

  return entry.offers;
}

function setCache(cacheKey, offers) {
  if (!cacheKey) return;
  if (!Array.isArray(offers) || offers.length === 0) return;

  if (NEGATIVE_CACHE_ENABLED) {
    MARKET_NEGATIVE_CACHE.delete(cacheKey);
  }

  MARKET_CACHE.set(cacheKey, {
    ts: Date.now(),
    offers
  });

  setDiskCache(cacheKey, offers);
}

/**
 * MOCK: oferty rynkowe (fallback)
 */
const MOCK_OFFERS = [
  {
    seller: "Coolblue",
    price: 449.99,
    currency: "EUR",
    availability: "in_stock",
    reviewScore: 4.6,
    reviewCount: 1240,
    url: "https://example.com/product/1",
    deliveryTime: 1 // 1 dzień
  },
  {
    seller: "Marktplaats",
    price: 299.99,
    currency: "EUR",
    availability: "in_stock",
    reviewScore: 2.1,
    reviewCount: 12,
    url: "https://example.com/product/2",
    deliveryTime: 5 // 5 dni (wolna dostawa)
  },
  {
    seller: "bol.com",
    price: 469.99,
    currency: "EUR",
    availability: "in_stock",
    reviewScore: 4.4,
    reviewCount: 540,
    url: "https://example.com/product/3",
    deliveryTime: 2 // 2 dni
  }
];

/**
 * Typ API (co faktycznie używamy):
 * – SearchAPI.io, engine=google_shopping (GET api/v1/search?engine=google_shopping).
 * – To NIE jest: Google Custom Search API (10/page), Places API (20/page, max 60),
 *   Shopping Content API (Merchant) ani Maps/Nearby.
 * – Limity wyników zależą od SearchAPI.io i ich planu; parametr num (do 100) i page.
 * – Dla NL Google często zwraca mało wyników na jedną stronę (np. 4–30).
 */
/** Jedna funkcja mapująca element API (shopping_results lub shopping_ads) do formatu Dealsense */
function mapItemToOffer(item, isAd = false) {
  let deliveryTime = null;
  if (item.delivery) {
    const deliveryText = String(item.delivery).toLowerCase();
    const dayMatch = deliveryText.match(/(\d+)\s*days?/);
    if (dayMatch) {
      deliveryTime = parseInt(dayMatch[1]);
    } else if (deliveryText.includes("tomorrow") || deliveryText.includes("morgen")) {
      deliveryTime = 1;
    } else if (deliveryText.includes("same day") || deliveryText.includes("vandaag")) {
      deliveryTime = 0.5;
    }
  }
  const price = item.extracted_price != null ? Number(item.extracted_price) : (parseFloat(String(item.price || "0").replace(/[^\d,.]/g, "").replace(",", ".")) || 0);
  const seller = item.seller || item.source || (item.title ? item.title.slice(0, 30) : "Andere winkel");
  return {
    seller,
    price,
    currency: "EUR",
    availability: item.in_stock === false ? "out_of_stock" : "in_stock",
    reviewScore: parseFloat(item.rating) || 0,
    reviewCount: parseInt(item.reviews, 10) || 0,
    url: item.product_link || item.link || "",
    title: item.title || "",
    thumbnail: item.thumbnail || item.image || "",
    deliveryTime
  };
}

/** Klucz do deduplikacji oferty (ta sama strona + seller + cena = duplikat). */
function offerDedupKey(o) {
  return `${o.url || ""}|${o.seller || ""}|${o.price ?? ""}`;
}

async function fetchGoogleShoppingOffers(productName, maxResults = 60) {
  const provider = String(process.env.MARKET_PROVIDER || "").trim().toLowerCase() || "searchapi";
  const providerChain = (() => {
    const raw = String(process.env.MARKET_PROVIDER_CHAIN || "").trim();
    if (!raw) return [provider];
    return raw
      .split(",")
      .map((s) => String(s || "").trim().toLowerCase())
      .filter(Boolean);
  })();
  const LOG_SILENT = (() => {
    const v = String(process.env.MARKET_LOG_SILENT || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  const ENRICH_SELLERS_ENABLED = (() => {
    const v = String(process.env.MARKET_ENRICH_SELLERS_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  const enrichLimit = Math.max(0, Math.min(Number(process.env.MARKET_ENRICH_SELLERS_LIMIT) || 3, 10));

  const hp = hpConfig();
  const started = Date.now();
  const budgetDeadline = hp.enabled && hp.budgetMs ? started + hp.budgetMs : null;
  const wantAfterFilter = hp.enabled ? Math.max(1, hp.targetOffers) : null;
  const wantRaw = hp.enabled ? Math.max(1, Math.min(Math.floor(Number(maxResults) || 60), 100)) : null;

  function timeLeftMs() {
    if (!budgetDeadline) return null;
    return Math.max(0, budgetDeadline - Date.now());
  }

  function buildQueryCandidates(q) {
    const base = String(q || "").trim();
    if (!base) return [];
    if (!hp.enabled || !hp.nlVariantEnabled) return [base];
    return [base, `${base} Nederland`, `${base} site:.nl`];
  }

  function mergeDedup(into, incoming, limit) {
    const out = Array.isArray(into) ? into : [];
    const arr = Array.isArray(incoming) ? incoming : [];
    if (!arr.length) return out;
    const seen = new Set(out.map((o) => offerDedupKey(o)));
    for (const o of arr) {
      const k = offerDedupKey(o);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(o);
      if (typeof limit === "number" && out.length >= limit) break;
    }
    return out;
  }

  function countGoodOffers(list) {
    try {
      const filtered = filterNlRetailOnly(filterBlockedOffers(Array.isArray(list) ? list : []));
      return Array.isArray(filtered) ? filtered.length : 0;
    } catch (_) {
      return 0;
    }
  }

  try {
    const maxPages = hp.enabled && hp.maxPages != null ? hp.maxPages : GOOGLE_SHOPPING_NUM_PAGES;
    const numPages = Math.max(1, Math.min(maxPages || 1, 5)); // Zwiększone z 2 do 5
    let offersFromProvider = null;
    let usedProvider = null;
    for (const p of providerChain) {
      const left = timeLeftMs();
      if (left != null && left <= 0) break;

      const providerTimeout = (() => {
        if (!hp.enabled) return null;
        if (hp.providerTimeoutMs != null) return hp.providerTimeoutMs;
        if (left != null) return Math.max(250, Math.min(left, 8000));
        return 8000;
      })();

      if (p === "serpapi") {
        const key = String(SERPAPI_API_KEY || "").trim();
        if (!key) continue;
        usedProvider = "serpapi";
        let merged = null;
        for (const q of buildQueryCandidates(productName)) {
          const left2 = timeLeftMs();
          if (left2 != null && left2 <= 0) break;
          // eslint-disable-next-line no-await-in-loop
          const r = await withProviderSlot(() =>
            withTimeout(
              fetchSerpApiOffers({
                query: q,
                ean: null,
                maxResults,
                apiKey: key,
                enrichSellers: ENRICH_SELLERS_ENABLED,
                enrichLimit,
              }),
              providerTimeout
            )
          ).catch(() => null);

          if (!hp.enabled || hp.mergeQueries !== true) {
            if (Array.isArray(r) && r.length > 0) {
              merged = r;
              break;
            }
            continue;
          }

          merged = mergeDedup(merged, r, wantRaw);
          if (wantAfterFilter != null && merged && countGoodOffers(merged) >= wantAfterFilter) break;
          if (wantRaw != null && merged && merged.length >= wantRaw) break;
        }
        offersFromProvider = merged;
      } else {
        const key = String(GOOGLE_SHOPPING_API_KEY || "").trim();
        if (!key) continue;
        usedProvider = "searchapi";
        let merged = null;
        for (const q of buildQueryCandidates(productName)) {
          const left2 = timeLeftMs();
          if (left2 != null && left2 <= 0) break;
          // eslint-disable-next-line no-await-in-loop
          const r = await withProviderSlot(() =>
            withTimeout(
              fetchSearchApiOffers({
                query: q,
                ean: null,
                maxResults,
                pages: numPages,
                apiKey: key,
              }),
              providerTimeout
            )
          ).catch(() => null);

          if (!hp.enabled || hp.mergeQueries !== true) {
            if (Array.isArray(r) && r.length > 0) {
              merged = r;
              break;
            }
            continue;
          }

          merged = mergeDedup(merged, r, wantRaw);
          if (wantAfterFilter != null && merged && countGoodOffers(merged) >= wantAfterFilter) break;
          if (wantRaw != null && merged && merged.length >= wantRaw) break;
        }
        offersFromProvider = merged;
      }

      if (offersFromProvider && offersFromProvider.length > 0) break;
      offersFromProvider = null;
      usedProvider = null;
    }

    if (!offersFromProvider || offersFromProvider.length === 0) return null;

    let offers = offersFromProvider;
    if (SORT_NICHE_SHOPS_FIRST) {
      offers = offers.slice().sort((a, b) => {
        const revA = a.reviewCount != null ? a.reviewCount : 999999;
        const revB = b.reviewCount != null ? b.reviewCount : 999999;
        if (revA !== revB) return revA - revB;
        return (a.price != null ? a.price : Infinity) - (b.price != null ? b.price : Infinity);
      });
    }

    if (!LOG_SILENT) {
      console.log(`✅ Znaleziono ${offers.length} ofert z Google Shopping (${numPages} str.(y))`);
    }
    const src = usedProvider === "serpapi" ? "google_serpapi" : "google_searchapi";
    const tagged = offers.map((o) => ({ ...o, _source: src }));
    if (!hp.enabled || wantAfterFilter == null) return tagged;

    // Early-exit hint: if after filtering we already have enough offers, callers can avoid extra work.
    // We cannot access higher-level filters here, but we can at least cap and return.
    return tagged;
  } catch (error) {
    return null;
  }
}

/**
 * Główna funkcja pobierania ofert rynkowych
 * Próbuje różnych źródeł w kolejności priorytetu
 */
async function fetchMarketOffers(productName, ean = null, options = {}) {
  const startedTotal = Date.now();
  let offers = null;
  
  // Extract rotation options
  const { userId = null, userLocation = null, geoEnabled = false } = options;

  const hp = hpConfig();

  const CACHE_BYPASS = (() => {
    const v = String(process.env.MARKET_CACHE_BYPASS || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  // Jeśli nie mamy nazwy produktu, ale mamy EAN, użyj EAN jako zapytania do Google Shopping.
  // To minimalnie zwiększa trafność bez zwiększania liczby requestów (nadal pages=1 domyślnie).
  const effectiveProductName = (productName && String(productName).trim()) || (ean ? String(ean).trim() : "");

  // Cache po EAN / nazwie produktu – skraca czas odpowiedzi i zmniejsza koszty API
  const cacheKey = getCacheKey(effectiveProductName, ean);

  // Optional prewarm enqueue on cache miss: safe no-op unless enabled.
  // This does not change the runtime response; it only records work for a future worker (kwant).
  // NOTE: We enqueue only when we are about to go to network (miss) to avoid queue spam.
  const prewarmPayload = cacheKey ? { cacheKey, q: effectiveProductName || null, ean: ean ? String(ean).trim() : null } : null;

  if (!CACHE_BYPASS && cacheKey) {
    const inflight = MARKET_INFLIGHT.get(cacheKey);
    if (inflight) {
      metricsInc("inflight_wait");
      return inflight;
    }
  }

  let staleWarmup = null;
  if (!CACHE_BYPASS && cacheKey) {
    const entry = MARKET_CACHE.get(cacheKey);
    if (entry && entry.ts && Array.isArray(entry.offers) && entry.offers.length > 0) {
      const age = Date.now() - entry.ts;
      if (age <= CACHE_TTL_MS) {
        return entry.offers;
      }
      if (age > CACHE_TTL_MS && age <= (CACHE_TTL_MS + STALE_WHILE_REVALIDATE_MS)) {
        staleWarmup = { cacheKey, offers: entry.offers };
      }
    }
  }
  if (!CACHE_BYPASS) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      metricsInc("memory_hit");
      return filterNlRetailOnly(filterBlockedOffers(cached)).map((o) => {
        if (o && typeof o === "object" && typeof o._source === "string") return o;
        const url = o && typeof o.url === "string" ? o.url : "";
        const inferred = url.includes("example.com") ? "mock" : "google";
        return { ...o, _source: inferred };
      });
    }
  }

  if (!CACHE_BYPASS) {
    const diskCached = getFromDiskCache(cacheKey);
    if (diskCached) {
      metricsInc("disk_hit");
      const filtered = filterNlRetailOnly(filterBlockedOffers(diskCached));
      setCache(cacheKey, filtered);
      return filtered.map((o) => {
        if (o && typeof o === "object" && typeof o._source === "string") return o;
        const url = o && typeof o.url === "string" ? o.url : "";
        const inferred = url.includes("example.com") ? "mock" : "google";
        return { ...o, _source: inferred };
      });
    }
  }

  // Redis cache (Upstash) — jeśli dostępny
  if (!CACHE_BYPASS) {
    const redisCached = await getFromRedisCache(cacheKey);
    if (redisCached) {
      metricsInc("redis_hit");
      // Wypełnij też lokalny cache (szybciej na kolejne requesty)
      const filtered = filterNlRetailOnly(filterBlockedOffers(redisCached));
      setCache(cacheKey, filtered);
      return filtered.map((o) => {
        if (o && typeof o === "object" && typeof o._source === "string") return o;
        const url = o && typeof o.url === "string" ? o.url : "";
        const inferred = url.includes("example.com") ? "mock" : "google";
        return { ...o, _source: inferred };
      });
    }
  }

  if (prewarmPayload) {
    enqueuePrewarm(prewarmPayload);
    enqueueKwantCorePrewarm(prewarmPayload);
    enqueueKwantHybridKickoff(prewarmPayload);
  }

  metricsInc("miss");

  const doFetchAndCache = async () => {
    const startedNetwork = Date.now();
    metricsInc("network_fetch");
    
    // 1. WŁASNY CRAWLER (PRIORITY #1) - jeśli włączony
    if (USE_OWN_CRAWLER && effectiveProductName) {
      const LOG_SILENT_2 = (() => {
        const v = String(process.env.MARKET_LOG_SILENT || "").trim().toLowerCase();
        return v === "1" || v === "true";
      })();
      
      if (!LOG_SILENT_2) {
        console.log(`🕷️  Używam własnego crawlera dla: ${effectiveProductName}`);
      }
      
      try {
        const crawlerOffers = await crawlerSearch.searchProduct({
          query: effectiveProductName,
          ean: ean || null,
          maxDomains: CRAWLER_MAX_DOMAINS,
          category: 'products',
          userId,
          userLocation,
          geoEnabled
        });
        
        if (Array.isArray(crawlerOffers) && crawlerOffers.length > 0) {
          // Normalize crawler offers to match API format
          const normalizedOffers = crawlerOffers.map(o => ({
            seller: o.seller || o._domain || 'Unknown',
            price: o.price || 0,
            currency: o.currency || 'EUR',
            availability: o.availability || 'in_stock',
            reviewScore: o.reviewScore || o.rating || 0,
            reviewCount: o.reviewCount || o.reviews || 0,
            url: o.url || '',
            title: o.title || effectiveProductName,
            thumbnail: o.thumbnail || o.image || '',
            deliveryTime: o.deliveryTime || null,
            _source: 'crawler',
            _domain: o._domain || null,
            _cached: o._cached || false
          }));
          
          const filtered = filterNlRetailOnly(filterBlockedOffers(normalizedOffers));
          
          if (!LOG_SILENT_2) {
            console.log(`✅ Crawler znalazł ${filtered.length} ofert z ${CRAWLER_MAX_DOMAINS} domen`);
          }
          
          if (!CACHE_BYPASS) {
            setCache(cacheKey, filtered);
            setRedisCache(cacheKey, filtered);
          }
          
          metricsTiming("network_total", Date.now() - startedNetwork);
          return filtered;
        }
        
        if (!LOG_SILENT_2) {
          console.log(`⚠️  Crawler nie znalazł ofert, próbuję API fallback...`);
        }
      } catch (crawlerError) {
        if (!LOG_SILENT_2) {
          console.error(`❌ Crawler error:`, crawlerError.message);
          console.log(`⚠️  Fallback do API...`);
        }
      }
    }
    
    // 2. Fashion provider (optional): only when explicitly enabled.
    // If provider returns results, we treat them as authoritative and cache them.
    const fashionEnabled = (() => {
      const v = String(process.env.MARKET_FASHION_PROVIDER_ENABLED || "").trim().toLowerCase();
      return v === "1" || v === "true";
    })();

    const isFashionQuery = (() => {
      const q = String(effectiveProductName || "").toLowerCase();
      if (!q) return false;
      const kw = [
        "sneaker",
        "schoenen",
        "hardloopschoenen",
        "jurk",
        "jeans",
        "hoodie",
        "t-shirt",
        "tshirt",
        "ondergoed",
        "zonnebril",
        "winterjas",
        "jas",
        "kinder schoenen",
      ];
      return kw.some((k) => q.includes(k));
    })();

    if (fashionEnabled && isFashionQuery) {
      const r = await fetchFashionOffers({ query: effectiveProductName, ean, maxResults: GOOGLE_SHOPPING_NUM_RESULTS }).catch(() => null);
      if (Array.isArray(r) && r.length > 0) {
        metricsInc("fashion_hit");
        const tagged = r.map((o) => (o && typeof o === "object" ? { ...o, _source: o._source || "fashion" } : o));
        const filteredFashion = filterNlRetailOnly(filterBlockedOffers(tagged));
        if (!CACHE_BYPASS) {
          setCache(cacheKey, filteredFashion);
          setRedisCache(cacheKey, filteredFashion);
        }
        metricsTiming("network_total", Date.now() - startedNetwork);
        return filteredFashion;
      }
    }

    // 3. Google Shopping API (fallback gdy crawler nie działa)
    if (effectiveProductName) {
      offers = await fetchGoogleShoppingOffers(effectiveProductName, GOOGLE_SHOPPING_NUM_RESULTS);
      if (offers && offers.length > 0) {
        const beforeFilters = offers.length;
        const beforeShops = [...new Set(offers.map(o => o.seller))];
        
        const afterBlocked = filterBlockedOffers(offers);
        const blockedShops = [...new Set(afterBlocked.map(o => o.seller))];
        
        const afterNlRetail = filterNlRetailOnly(afterBlocked);
        const finalShops = [...new Set(afterNlRetail.map(o => o.seller))];
        
        console.log(`[MARKET] Filtering: ${beforeFilters} → blocked: ${afterBlocked.length} → NL retail: ${afterNlRetail.length}`);
        console.log(`[MARKET] Shops BEFORE: ${beforeShops.slice(0, 10).join(', ')}${beforeShops.length > 10 ? '...' : ''}`);
        console.log(`[MARKET] Shops AFTER blocked: ${blockedShops.slice(0, 10).join(', ')}${blockedShops.length > 10 ? '...' : ''}`);
        console.log(`[MARKET] Shops AFTER NL retail: ${finalShops.join(', ')}`);
        
        offers = afterNlRetail.map((o) => {
          if (o && typeof o === "object" && typeof o._source === "string") return o;
          return { ...o, _source: "google" };
        });
        const LOG_SILENT_2 = (() => {
          const v = String(process.env.MARKET_LOG_SILENT || "").trim().toLowerCase();
          return v === "1" || v === "true";
        })();
        if (!LOG_SILENT_2) {
          console.log(`✅ Znaleziono ${offers.length} ofert z Google Shopping`);
        }
        if (!CACHE_BYPASS) {
          setCache(cacheKey, offers);
          setRedisCache(cacheKey, offers);
        }
        metricsTiming("network_total", Date.now() - startedNetwork);
        return offers;
      }

      if (NEGATIVE_CACHE_ENABLED && cacheKey && (!hp.enabled || hp.suppressNegativeCache !== true)) {
        MARKET_NEGATIVE_CACHE.set(cacheKey, { ts: Date.now() });
      }
    }
    return null;
  };

  if (staleWarmup && Array.isArray(staleWarmup.offers)) {
    if (cacheKey && !MARKET_INFLIGHT.has(cacheKey)) {
      const p = doFetchAndCache().finally(() => MARKET_INFLIGHT.delete(cacheKey));
      MARKET_INFLIGHT.set(cacheKey, p);
      void p.catch(() => {});
    }
    return staleWarmup.offers;
  }

  if (!CACHE_BYPASS && cacheKey) {
    const p = doFetchAndCache().finally(() => MARKET_INFLIGHT.delete(cacheKey));
    MARKET_INFLIGHT.set(cacheKey, p);
    const r = await p;
    metricsTiming("fetchMarketOffers_total", Date.now() - startedTotal);
    if (r) return r;
  } else {
    const r = await doFetchAndCache();
    metricsTiming("fetchMarketOffers_total", Date.now() - startedTotal);
    if (r) return r;
  }

  // 2. TODO: Próba bol.com API (wymaga EAN i klucza API)
  // if (ean) {
  //   offers = await fetchBolComOffers(ean);
  //   if (offers && offers.length > 0) return offers;
  // }

  // 3. Fallback do mock danych (dynamiczne oferty pasujące do produktu)
  if (USE_MOCK_FALLBACK) {
    // Wyciszamy log - mock dane są celowo używane (to jest OK)
    
    // Funkcja generująca dynamiczne mock oferty na podstawie ceny bazowej
    function generateDynamicOffers(basePrice) {
      if (!basePrice || basePrice <= 0) {
        return MOCK_OFFERS.map((o) => ({ ...o, _source: "mock" })); // Fallback do standardowych
      }
      
      // Generuj 3 oferty w zakresie ±30% od ceny bazowej
      const offer1 = basePrice * 0.85; // 15% taniej
      const offer2 = basePrice * 0.95; // 5% taniej
      const offer3 = basePrice * 1.10; // 10% drożej
      
      return [
        {
          seller: "TechStore",
          price: Number(offer1.toFixed(2)),
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.5,
          reviewCount: Math.floor(Math.random() * 500) + 100,
          url: "https://example.com/product/1",
          deliveryTime: 1, // 1 dzień (szybka dostawa)
          _source: "mock"
        },
        {
          seller: "ElectroShop",
          price: Number(offer2.toFixed(2)),
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.3,
          reviewCount: Math.floor(Math.random() * 300) + 50,
          url: "https://example.com/product/2",
          deliveryTime: 2, // 2 dni
          _source: "mock"
        },
        {
          seller: "BudgetTech",
          price: Number(offer3.toFixed(2)),
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 3.8,
          reviewCount: Math.floor(Math.random() * 100) + 20,
          url: "https://example.com/product/3",
          deliveryTime: 3, // 3 dni (wolniejsza dostawa)
          _source: "mock"
        }
      ];
    }

    // Jeśli mamy nazwę produktu, spróbuj wygenerować realistyczne mock oferty
    // w oparciu o typ produktu (powerbank, laptop, etc.)
    if (productName) {
      const offersFromCatalog = buildMockOffersForProductName(productName, MOCK_OFFERS);
      if (Array.isArray(offersFromCatalog) && offersFromCatalog.length > 0) {
        setCache(cacheKey, offersFromCatalog);
        return offersFromCatalog;
      }
    }

    // If catalog did not match, use dynamic mocks as a better generic fallback.
    // We try to infer a numeric base price from the query string (best-effort).
    const inferredBasePrice = (() => {
      const s = typeof productName === "string" ? productName : "";
      const m = s.match(/(\d{2,6})(?:[\.,](\d{1,2}))?/);
      if (!m) return null;
      const whole = m[1];
      const frac = m[2] || "";
      const n = Number(frac ? `${whole}.${frac}` : whole);
      return Number.isFinite(n) ? n : null;
    })();
    const dyn = generateDynamicOffers(inferredBasePrice);
    if (Array.isArray(dyn) && dyn.length > 0) {
      setCache(cacheKey, dyn);
      metricsTiming("fetchMarketOffers_total", Date.now() - startedTotal);
      return dyn;
    }
    
    // Domyślnie zwróć standardowe mock oferty (dla produktów bez rozpoznanej kategorii)
    // UWAGA: Te oferty będą filtrowane w server.js na podstawie ceny bazowej
    const fallbackOffers = MOCK_OFFERS.map((o) => ({ ...o, _source: "mock" }));
    setCache(cacheKey, fallbackOffers);
    return fallbackOffers;
  }

  return [];
}

/**
 * Eksport funkcji
 */
module.exports = {
  fetchMarketOffers,
  fetchGoogleShoppingOffers,
  MOCK_OFFERS,
  getMarketMetricsSnapshot,
  GOOGLE_SHOPPING_NUM_RESULTS,
  GOOGLE_SHOPPING_NUM_PAGES,
  SORT_NICHE_SHOPS_FIRST,
  hpConfig
};
