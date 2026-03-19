"use strict";

const http = require("http");
const https = require("https");
const axiosLib = require("axios");

const axios = axiosLib.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

function parseDeliveryTimeDays(input) {
  if (!input) return null;
  const deliveryText = String(input).toLowerCase();
  const dayMatch = deliveryText.match(/(\d+)\s*days?/);
  if (dayMatch) return parseInt(dayMatch[1], 10);
  if (deliveryText.includes("tomorrow") || deliveryText.includes("morgen")) return 1;
  if (deliveryText.includes("same day") || deliveryText.includes("vandaag")) return 0.5;
  return null;
}

function mapItemToOffer(item) {
  const price =
    item && item.extracted_price != null
      ? Number(item.extracted_price)
      : parseFloat(String(item && item.price ? item.price : "0").replace(/[^\d,.]/g, "").replace(",", ".")) || 0;

  const seller = item && (item.seller || item.source || item.merchant) ? (item.seller || item.source || item.merchant) : "Andere winkel";

  return {
    seller,
    price,
    currency: "EUR",
    availability: item && item.in_stock === false ? "out_of_stock" : "in_stock",
    reviewScore: parseFloat(item && item.rating) || 0,
    reviewCount: parseInt(item && item.reviews, 10) || 0,
    url: (item && (item.product_link || item.link)) || "",
    title: (item && item.title) || "",
    thumbnail: (item && (item.thumbnail || item.image)) || "",
    deliveryTime: parseDeliveryTimeDays(item && item.delivery),
  };
}

function offerDedupKey(o) {
  return `${o.url || ""}|${o.seller || ""}|${o.price ?? ""}`;
}

async function fetchOffers({ query, ean, maxResults, pages, apiKey }) {
  const key = (apiKey || "").trim();
  if (!key || key.startsWith("sk-proj-")) return null;

  const timeoutMs = (() => {
    const baseRaw = String(process.env.MARKET_PROVIDER_HTTP_TIMEOUT_MS || "8000").trim();
    const base = Number(baseRaw);
    const baseMs = Number.isFinite(base) && base > 0 ? Math.max(500, Math.min(Math.floor(base), 60000)) : 8000;

    const hpEnabled = (() => {
      const v = String(process.env.MARKET_HP_ENABLED || "").trim().toLowerCase();
      return v === "1" || v === "true";
    })();

    if (!hpEnabled) return baseMs;

    const hpRaw = String(process.env.MARKET_HP_PROVIDER_TIMEOUT_MS || "").trim();
    const hp = hpRaw ? Number(hpRaw) : NaN;
    if (!Number.isFinite(hp) || hp <= 0) return baseMs;
    const hpMs = Math.max(250, Math.min(Math.floor(hp), 60000));
    return Math.min(baseMs, hpMs);
  })();

  const LOG_HTTP = (() => {
    const v = String(process.env.MARKET_LOG_HTTP || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  const want = Math.max(1, Math.min(Number(maxResults) || 60, 100));
  const numPages = Math.max(1, Math.min(Number(pages) || 1, 5));
  const seen = new Set();
  const allOffers = [];

  const q = (query && String(query).trim()) || (ean ? String(ean).trim() : "");
  if (!q) return null;

  for (let page = 1; page <= numPages; page++) {
    if (allOffers.length >= want) break;
    let response;
    try {
      response = await axios.get("https://www.searchapi.io/api/v1/search", {
        params: {
          api_key: key,
          engine: "google_shopping",
          q,
          gl: "nl",
          hl: "nl",
          location: "Netherlands",
          num: want,
          page,
        },
        timeout: timeoutMs,
        validateStatus: () => true,
      });
    } catch (err) {
      if (LOG_HTTP) {
        console.error("[SearchAPI] Request failed:", {
          page,
          q,
          message: (err && err.message) || String(err),
          code: err && err.code ? err.code : null,
          timeoutMs,
        });
      }
      return null;
    }

    if (!response || response.status < 200 || response.status >= 300) {
      if (LOG_HTTP) {
        const st = response ? response.status : null;
        const body = response && response.data != null ? response.data : null;
        let bodyStr = "";
        try {
          bodyStr = typeof body === "string" ? body : JSON.stringify(body);
        } catch (_) {
          bodyStr = "[unstringifiable]";
        }
        if (bodyStr && bodyStr.length > 500) bodyStr = bodyStr.slice(0, 500) + "...";
        console.error("[SearchAPI] Non-2xx response:", { status: st, page, q, body: bodyStr });
      }
      return null;
    }

    const data = response.data || {};
    const shoppingResults = Array.isArray(data.shopping_results) ? data.shopping_results : [];
    const shoppingAds = Array.isArray(data.shopping_ads) ? data.shopping_ads : [];

    // ZAWSZE loguj ile wyników zwrócił SearchAPI
    console.log(`[SearchAPI] Page ${page}: shopping_results=${shoppingResults.length}, shopping_ads=${shoppingAds.length}, total=${shoppingResults.length + shoppingAds.length}`);

    if (LOG_HTTP && shoppingResults.length === 0 && shoppingAds.length === 0) {
      const keys = data && typeof data === "object" ? Object.keys(data).slice(0, 40) : [];
      console.error("[SearchAPI] 2xx but no shopping results:", {
        status: response.status,
        page,
        q,
        topLevelKeys: keys,
      });
    }

    const rawItems = [...shoppingResults, ...shoppingAds].map(mapItemToOffer);
    for (const o of rawItems) {
      if (!o || typeof o.price !== "number" || !Number.isFinite(o.price) || o.price <= 0) continue;
      const k = offerDedupKey(o);
      if (seen.has(k)) continue;
      seen.add(k);
      allOffers.push({ ...o, _source: "google" });
      if (allOffers.length >= want) break;
    }

    if (shoppingResults.length === 0 && shoppingAds.length === 0) break;
  }

  if (!allOffers.length) return null;
  return allOffers.slice(0, want);
}

module.exports = {
  fetchOffers,
};
