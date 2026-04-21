"use strict";

function parseDeliveryDays(input) {
  if (input == null) return null;
  if (typeof input === "number" && Number.isFinite(input) && input >= 0) return input;
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

function normalizeOfferDeliveryDays(offer) {
  if (!offer || typeof offer !== "object") return offer;
  if (offer.deliveryTime != null) return offer;
  const parsed = parseDeliveryDays(offer.delivery || offer.shipping || offer.delivery_time);
  if (parsed == null) return offer;
  return { ...offer, deliveryTime: parsed };
}

function filterByMaxDeliveryDays(offers, maxDays) {
  const max = Number(maxDays);
  if (!Number.isFinite(max) || max <= 0) return offers;
  return (Array.isArray(offers) ? offers : []).filter((o) => {
    const d = o && typeof o.deliveryTime === "number" ? o.deliveryTime : null;
    return d == null || d <= max;
  });
}

module.exports = {
  parseDeliveryDays,
  normalizeOfferDeliveryDays,
  filterByMaxDeliveryDays,
};
