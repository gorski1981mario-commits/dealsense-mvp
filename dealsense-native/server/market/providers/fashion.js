"use strict";

const { fetchOffers: fetchSearchApiOffers } = require("./searchapi");

function norm(s) {
  return typeof s === "string" ? s.trim().replace(/\s+/g, " ") : "";
}

function toKey(o) {
  if (!o || typeof o !== "object") return "";
  const seller = typeof o.seller === "string" ? o.seller.trim().toLowerCase() : "";
  const url = typeof o.url === "string" ? o.url.trim() : "";
  const price = typeof o.price === "number" ? o.price : Number(o.price);
  const p = Number.isFinite(price) ? price.toFixed(2) : "";
  return `${seller}|${url}|${p}`;
}

function mergeOffers(lists, maxTotal) {
  const limit = typeof maxTotal === "number" && Number.isFinite(maxTotal) ? Math.max(1, Math.min(Math.floor(maxTotal), 300)) : 120;
  const out = [];
  const seen = new Set();
  for (const list of lists) {
    const arr = Array.isArray(list) ? list : [];
    for (const o of arr) {
      const k = toKey(o);
      if (k && seen.has(k)) continue;
      if (k) seen.add(k);
      out.push(o);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function expandFashionQueries(query) {
  const q = norm(query);
  if (!q) return [];

  const base = q;
  const ql = q.toLowerCase();

  const hasNl = /\b(nl|nederland)\b/i.test(ql);
  const hasMaat = /\b(maat|eu|us|uk|w\d+|l\d+|\d{2}(?:\s*\d\/\d)?|xs|s|m|l|xl|xxl)\b/i.test(ql);
  const hasGender = /\b(heren|dames|kind(?:eren)?|kids|men|women|unisex)\b/i.test(ql);
  const hasNew = /\b(nieuw|new)\b/i.test(ql);

  const variants = [];
  variants.push(base);
  if (!hasNl) variants.push(`${base} Nederland`);
  if (!hasGender) variants.push(`${base} heren`);
  if (!hasGender) variants.push(`${base} dames`);
  if (!hasMaat) variants.push(`${base} maat`);
  if (!hasNew) variants.push(`${base} nieuw`);

  const uniq = [];
  const seen = new Set();
  for (const v of variants) {
    const s = norm(v);
    if (!s) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(s);
    if (uniq.length >= 4) break;
  }
  return uniq;
}

async function fetchOffers({ query, ean, maxResults }) {
  const qs = expandFashionQueries(query);
  if (qs.length === 0) return null;

  const max = typeof maxResults === "number" && Number.isFinite(maxResults) ? Math.max(1, Math.min(Math.floor(maxResults), 100)) : 80;
  const apiKey = String(process.env.GOOGLE_SHOPPING_API_KEY || "").trim();
  const lists = [];

  for (const q of qs) {
    // eslint-disable-next-line no-await-in-loop
    const r = await fetchSearchApiOffers({ query: q, ean: ean || null, maxResults: max, apiKey }).catch(() => null);
    if (Array.isArray(r) && r.length > 0) lists.push(r);
  }

  if (lists.length === 0) return null;
  return mergeOffers(lists, max);
}

module.exports = {
  fetchOffers,
};
