"use strict";

const crypto = require("crypto");

function stableStringify(obj) {
  const seen = new Set();
  const normalize = (v) => {
    if (v == null) return null;
    if (typeof v !== "object") return v;
    if (seen.has(v)) return "[circular]";
    seen.add(v);
    if (Array.isArray(v)) return v.map(normalize);
    const out = {};
    for (const k of Object.keys(v).sort()) {
      out[k] = normalize(v[k]);
    }
    return out;
  };
  return JSON.stringify(normalize(obj));
}

function hashKey(payload) {
  const str = stableStringify(payload);
  return crypto.createHash("sha1").update(str).digest("hex");
}

function normalizeStr(v, maxLen) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  const out = s.toLowerCase();
  if (typeof maxLen === "number" && Number.isFinite(maxLen) && maxLen > 0) return out.slice(0, maxLen);
  return out;
}

function numOrNull(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildTop3CacheKey(input) {
  const i = input && typeof input === "object" ? input : {};
  const keyPayload = {
    product_name: normalizeStr(i.product_name, 200),
    ean: normalizeStr(i.ean, 32),
    url: normalizeStr(i.url, 800),
    base_price: numOrNull(i.base_price),
    maxDeliveryDays: numOrNull(i.maxDeliveryDays),
    matchMinScore: numOrNull(i.matchMinScore),
  };
  return `top3:${hashKey(keyPayload)}`;
}

function createTop3Cached(getTop3EchoOffers) {
  if (typeof getTop3EchoOffers !== "function") {
    throw new Error("createTop3Cached requires getTop3EchoOffers(fn)");
  }

  const CACHE_TTL_MS = Number(process.env.ECHO_TOP3_CACHE_TTL_MS) || 6 * 60 * 60 * 1000; // 6h
  const SWR_MS = Number(process.env.ECHO_TOP3_SWR_MS) || 30 * 60 * 1000; // 30m

  const cache = new Map(); // key -> { ts, value }
  const inflight = new Map(); // key -> Promise

  async function computeAndCache(key, input) {
    const p = (async () => {
      const value = await getTop3EchoOffers(input);
      cache.set(key, { ts: Date.now(), value });
      return value;
    })().finally(() => inflight.delete(key));

    inflight.set(key, p);
    return p;
  }

  async function get(input, opts) {
    const key = buildTop3CacheKey(input);
    const now = Date.now();
    const entry = cache.get(key);

    const allowStale = !(opts && opts.allowStale === false);

    if (entry && entry.ts && entry.value) {
      const age = now - entry.ts;
      if (age <= CACHE_TTL_MS) {
        return { value: entry.value, cache: { key, hit: true, stale: false, ageMs: age } };
      }
      if (allowStale && age <= CACHE_TTL_MS + SWR_MS) {
        if (!inflight.has(key)) {
          void computeAndCache(key, input).catch(() => {});
        }
        return { value: entry.value, cache: { key, hit: true, stale: true, ageMs: age } };
      }
    }

    const pending = inflight.get(key);
    if (pending) {
      const value = await pending;
      const e2 = cache.get(key);
      const ageMs = e2 && e2.ts ? Date.now() - e2.ts : null;
      return { value, cache: { key, hit: false, stale: false, inflight: true, ageMs } };
    }

    const value = await computeAndCache(key, input);
    return { value, cache: { key, hit: false, stale: false, ageMs: 0 } };
  }

  return {
    get,
    _debug: { cache, inflight },
  };
}

module.exports = {
  createTop3Cached,
};
