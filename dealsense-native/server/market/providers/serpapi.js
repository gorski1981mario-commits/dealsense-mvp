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
  const s = String(input).trim().toLowerCase();
  if (!s) return null;

  if (s.includes("vandaag") || s.includes("same day")) return 0.5;
  if (s.includes("morgen") || s.includes("tomorrow")) return 1;

  const range = s.match(/(\d+)\s*(?:-|–|to|tot|t\/m)\s*(\d+)\s*(?:dagen|days|werkdagen)/i);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) return Math.max(a, b);
  }

  const single = s.match(/(\d+)\s*(?:dagen|days|werkdagen)/i);
  if (single) {
    const n = Number(single[1]);
    if (Number.isFinite(n)) return n;
  }

  return null;
}

function mapItemToOffer(item) {
  const price =
    item && item.extracted_price != null
      ? Number(item.extracted_price)
      : parseFloat(String(item && item.price ? item.price : "0").replace(/[^\d,.]/g, "").replace(",", ".")) || 0;

  const seller = (item && (item.source || item.seller || item.merchant)) || "Andere winkel";
  const url = (item && (item.product_link || item.link || item.tracking_link)) || "";

  return {
    seller,
    price,
    currency: "EUR",
    availability: item && item.in_stock === false ? "out_of_stock" : "in_stock",
    reviewScore: parseFloat(item && item.rating) || 0,
    reviewCount: parseInt(item && item.reviews, 10) || 0,
    url,
    title: (item && item.title) || "",
    thumbnail: (item && (item.thumbnail || item.serpapi_thumbnail)) || "",
    deliveryTime: parseDeliveryTimeDays(item && item.delivery),
  };
}

function offerDedupKey(o) {
  return `${o.url || ""}|${o.seller || ""}|${o.price ?? ""}`;
}

function parsePriceNumber(input) {
  if (input == null) return null;
  if (typeof input === "number" && Number.isFinite(input)) return input;
  const n = Number(String(input).replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(/,/g, "."));
  return Number.isFinite(n) ? n : null;
}

async function fetchSellersFromProductApi(productApiUrl) {
  const url = typeof productApiUrl === "string" ? productApiUrl.trim() : "";
  if (!url) return [];

  const resp = await axios.get(url, {
    timeout: 8000,
    validateStatus: () => true,
  });

  if (!resp || resp.status < 200 || resp.status >= 300) return [];

  const data = resp.data || {};
  const online =
    data &&
    data.sellers_results &&
    Array.isArray(data.sellers_results.online_sellers)
      ? data.sellers_results.online_sellers
      : [];

  return online
    .map((s) => {
      const price =
        parsePriceNumber(s && s.total_price) ??
        parsePriceNumber(s && s.base_price) ??
        parsePriceNumber(s && s.original_price);
      const seller = (s && (s.name || s.seller)) || "";
      const direct = (s && (s.direct_link || s.link)) || "";
      return {
        seller,
        price: price != null ? price : NaN,
        currency: "EUR",
        availability: "in_stock",
        reviewScore: parseFloat(s && s.rating) || 0,
        reviewCount: parseInt(s && s.reviews, 10) || 0,
        url: direct,
        title: "",
        thumbnail: "",
        deliveryTime: null,
      };
    })
    .filter((o) => o.seller && Number.isFinite(o.price) && o.price > 0 && o.url);
}

async function fetchOffers({ query, ean, maxResults, apiKey, enrichSellers, enrichLimit }) {
  const key = (apiKey || "").trim();
  if (!key) return null;

  const want = Math.max(1, Math.min(Number(maxResults) || 60, 100));

  const q = (query && String(query).trim()) || (ean ? String(ean).trim() : "");
  if (!q) return null;

  const response = await axios.get("https://serpapi.com/search.json", {
    params: {
      engine: "google_shopping",
      q,
      gl: "nl",
      hl: "nl",
      location: "Netherlands",
      num: want,
      api_key: key,
    },
    timeout: 8000,
    validateStatus: () => true,
  });

  if (!response || response.status < 200 || response.status >= 300) return null;

  const data = response.data || {};
  const results = Array.isArray(data.shopping_results) ? data.shopping_results : [];

  const seen = new Set();
  const out = [];

  const doEnrich = enrichSellers === true;
  const limit = Math.max(0, Math.min(Number(enrichLimit) || 0, 10));

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const o = mapItemToOffer(r);
    if (o && typeof o.price === "number" && Number.isFinite(o.price) && o.price > 0) {
      const k = offerDedupKey(o);
      if (!seen.has(k)) {
        seen.add(k);
        out.push({ ...o, _source: "google" });
        if (out.length >= want) break;
      }
    }

    if (doEnrich && i < limit) {
      if (out.length >= want) break;
      const productApiUrl = r && typeof r.serpapi_product_api === "string" ? r.serpapi_product_api : "";
      if (!productApiUrl) continue;
      try {
        const sellers = await fetchSellersFromProductApi(productApiUrl);
        for (const s of sellers) {
          const k2 = offerDedupKey(s);
          if (seen.has(k2)) continue;
          seen.add(k2);
          out.push({ ...s, _source: "google" });
          if (out.length >= want) break;
        }
      } catch (_) {
        // ignore enrichment failures
      }
    }
  }

  if (!out.length) return null;
  return out.slice(0, want);
}

module.exports = {
  fetchOffers,
};
