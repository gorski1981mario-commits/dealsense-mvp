"use strict";

const { normalizeSellerKey } = require("./seller");

function offerDedupeKeyForSelection(o) {
  if (!o || typeof o !== "object") return "";
  const seller = normalizeSellerKey(o.seller);
  const price = typeof o.price === "number" && Number.isFinite(o.price) ? o.price.toFixed(2) : "";
  let host = "";
  const url = typeof o.url === "string" ? o.url : "";
  if (url) {
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch (_) {
      host = "";
    }
  }
  return `${seller}|${host}|${price}`;
}

function dedupeOffersForSelection(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  const seen = new Set();
  const out = [];
  for (const o of list) {
    const key = offerDedupeKeyForSelection(o);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}

function pickTopUniqueSellers(list, limit) {
  if (!Array.isArray(list) || list.length === 0) return [];
  const out = [];
  const seen = new Set();
  const max = Math.max(0, Math.min(Number(limit) || 0, 20));
  for (const o of list) {
    if (out.length >= max) break;
    const key = normalizeSellerKey(o && o.seller);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}

function sortOffersByPriceAndPopularity(offers, getOfferClickBoost) {
  const boost = typeof getOfferClickBoost === "function" ? getOfferClickBoost : () => 0;
  return offers.slice().sort((a, b) => {
    const priceA = a.price != null ? a.price : Infinity;
    const priceB = b.price != null ? b.price : Infinity;
    const scoreA = priceA - boost(a.seller);
    const scoreB = priceB - boost(b.seller);
    if (scoreA !== scoreB) return scoreA - scoreB;
    return (b.reviewScore || 0) - (a.reviewScore || 0);
  });
}

module.exports = {
  offerDedupeKeyForSelection,
  dedupeOffersForSelection,
  pickTopUniqueSellers,
  sortOffersByPriceAndPopularity,
};
