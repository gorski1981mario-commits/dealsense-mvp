"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const axios = require("axios");

function safeJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function toNum(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmtTime(ms) {
  const n = toNum(ms);
  if (n == null || n < 0) return "";
  if (n < 1000) return "<1s";
  const s = Math.round((n / 1000) * 100) / 100;
  return `${s.toFixed(2)}s`;
}

async function postTop3(url, payload, timeoutMs) {
  const t0 = Date.now();
  let status = null;
  let data = null;
  let error = null;
  try {
    const resp = await axios.post(url, payload, {
      timeout: timeoutMs,
      validateStatus: () => true,
      headers: { "content-type": "application/json" },
    });
    status = resp.status;
    data = resp.data;
    if (status >= 400) {
      error = (data && data.error) || `http_${status}`;
    }
  } catch (e) {
    error = (e && e.message) || String(e);
  }
  const ms = Date.now() - t0;
  return { ms, status, error, data };
}

async function main() {
  const url = String(process.env.ECHO_URL || "http://localhost:4000/api/echo/top3").trim();
  const timeoutMs = Math.max(1000, Math.min(Number(process.env.ECHO_TIMEOUT_MS) || 15000, 60000));
  const runs = Math.max(2, Math.min(Number(process.env.ECHO_BENCH_RUNS) || 5, 20));

  // Use a stable payload so cache can hit.
  const payload = {
    product_name: process.env.ECHO_PRODUCT_NAME || "Sony WH-1000XM5",
    base_price: Number(process.env.ECHO_BASE_PRICE || 299),
    ean: process.env.ECHO_EAN || null,
    url: process.env.ECHO_PRODUCT_URL || null,
    matchMinScore: process.env.ECHO_MATCH_MIN_SCORE != null ? Number(process.env.ECHO_MATCH_MIN_SCORE) : null,
    maxDeliveryDays: process.env.ECHO_MAX_DELIVERY_DAYS != null ? Number(process.env.ECHO_MAX_DELIVERY_DAYS) : null,
    debug: true,
  };

  const results = [];
  for (let i = 0; i < runs; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const r = await postTop3(url, payload, timeoutMs);
    const cache = r && r.data && r.data.__cache ? r.data.__cache : null;
    results.push({
      i: i + 1,
      time: fmtTime(r.ms),
      ms: r.ms,
      status: r.status,
      error: r.error,
      cache: cache
        ? {
            hit: cache.hit,
            stale: cache.stale,
            inflight: cache.inflight || false,
            ageMs: cache.ageMs,
          }
        : null,
      returnedOffers: r.data && r.data.meta ? r.data.meta.returnedOffers : null,
      inputOffers: r.data && r.data.meta ? r.data.meta.inputOffers : null,
    });
  }

  const msList = results.map((x) => x.ms).filter((n) => typeof n === "number" && Number.isFinite(n));
  const avgMs = msList.length ? msList.reduce((s, n) => s + n, 0) / msList.length : null;

  console.log(
    safeJson({
      url,
      runs,
      avgTime: fmtTime(avgMs),
      avgMs,
      results,
    })
  );
}

main().catch((err) => {
  console.error("bench-echo-top3-cache failed:", (err && err.message) || err);
  process.exitCode = 1;
});
