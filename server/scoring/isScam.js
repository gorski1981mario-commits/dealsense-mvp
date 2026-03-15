"use strict";

const { normalizeSellerKey } = require("./seller");

function isScam(offer, marketAvg) {
  const SELLER_RULES_ENABLED = (() => {
    const v = String(process.env.PRICING_SELLER_RULES_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  let whitelist = null;
  let blacklist = null;
  if (SELLER_RULES_ENABLED) {
    try {
      whitelist = JSON.parse(String(process.env.PRICING_SELLER_WHITELIST_JSON || "[]"));
    } catch (_) {
      whitelist = null;
    }
    try {
      blacklist = JSON.parse(String(process.env.PRICING_SELLER_BLACKLIST_JSON || "[]"));
    } catch (_) {
      blacklist = null;
    }
  }

  const sellerKey = normalizeSellerKey(offer && offer.seller);
  if (SELLER_RULES_ENABLED && sellerKey) {
    if (
      Array.isArray(blacklist) &&
      blacklist.map(String).map((s) => s.trim().toLowerCase()).includes(sellerKey)
    ) {
      return true;
    }
    if (
      Array.isArray(whitelist) &&
      whitelist.map(String).map((s) => s.trim().toLowerCase()).includes(sellerKey)
    ) {
      return false;
    }
  }

  const minRating = Number(process.env.PRICING_SCAM_MIN_RATING);
  const minReviews = Number(process.env.PRICING_SCAM_MIN_REVIEWS);
  const minPriceRatio = Number(process.env.PRICING_SCAM_MIN_PRICE_RATIO);
  const MIN_RATING = Number.isFinite(minRating) ? minRating : 3.5;
  const MIN_REVIEWS = Number.isFinite(minReviews) ? Math.floor(minReviews) : 30;
  const MIN_PRICE_RATIO = Number.isFinite(minPriceRatio) ? minPriceRatio : 0.35;

  const NicheExceptionEnabled = (() => {
    const v = String(process.env.PRICING_NICHE_EXCEPTION_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  const nicheMinRating = Number(process.env.PRICING_NICHE_MIN_RATING);
  const nicheMinReviews = Number(process.env.PRICING_NICHE_MIN_REVIEWS);
  const NICHE_MIN_RATING = Number.isFinite(nicheMinRating) ? nicheMinRating : 4.6;
  const NICHE_MIN_REVIEWS = Number.isFinite(nicheMinReviews) ? Math.floor(nicheMinReviews) : 10;

  const rating = typeof offer.reviewScore === "number" ? offer.reviewScore : 0;
  const reviews = typeof offer.reviewCount === "number" ? offer.reviewCount : 0;
  const price = typeof offer.price === "number" ? offer.price : Infinity;

  if (rating < MIN_RATING) return true;

  if (reviews < MIN_REVIEWS) {
    if (!(NicheExceptionEnabled && rating >= NICHE_MIN_RATING && reviews >= NICHE_MIN_REVIEWS)) {
      return true;
    }
  }

  if (marketAvg > 0 && price < marketAvg * MIN_PRICE_RATIO) return true;
  return false;
}

module.exports = {
  isScam,
};
