"use strict";

const PRICING_ENABLE_SELLER_ALIASES = (() => {
  const v = String(process.env.PRICING_ENABLE_SELLER_ALIASES || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();

let PRICING_SELLER_ALIAS_MAP = {};
if (PRICING_ENABLE_SELLER_ALIASES) {
  const raw = String(process.env.PRICING_SELLER_ALIASES_JSON || "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        PRICING_SELLER_ALIAS_MAP = parsed;
      }
    } catch (_) {}
  }
}

function normalizeSellerKey(seller) {
  if (!seller || typeof seller !== "string") return "";
  const base = seller.trim().toLowerCase();
  if (!base) return "";
  if (!PRICING_ENABLE_SELLER_ALIASES) return base;
  const mapped =
    PRICING_SELLER_ALIAS_MAP && typeof PRICING_SELLER_ALIAS_MAP[base] === "string"
      ? PRICING_SELLER_ALIAS_MAP[base]
      : null;
  return mapped ? String(mapped).trim().toLowerCase() : base;
}

module.exports = {
  normalizeSellerKey,
};
