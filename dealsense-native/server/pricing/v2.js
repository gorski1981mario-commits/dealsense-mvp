"use strict";

const DEFAULT_CONFIG = {
  MIN_SHOPS: 15,
  MIN_RATING: 3.8,
  MAX_RATING: 4.2,
  MIN_REVIEWS_TOTAL: 50,
};

function clamp01(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function buildConfigFromEnv() {
  const cfg = { ...DEFAULT_CONFIG };

  const minShops = Number(process.env.PRICING_V2_MIN_SHOPS);
  const minRating = Number(process.env.PRICING_V2_MIN_RATING);
  const maxRating = Number(process.env.PRICING_V2_MAX_RATING);
  const minReviews = Number(process.env.PRICING_V2_MIN_REVIEWS_TOTAL);
  const softPenaltyEnabled = String(process.env.PRICING_V2_SOFT_REVIEW_PENALTY || "").trim();
  const penaltyReviewsTarget = Number(process.env.PRICING_V2_PENALTY_REVIEWS_TARGET);
  const penaltyStrength = Number(process.env.PRICING_V2_PENALTY_STRENGTH);

  if (Number.isFinite(minShops) && minShops > 0) cfg.MIN_SHOPS = Math.floor(minShops);
  if (Number.isFinite(minRating) && minRating > 0) cfg.MIN_RATING = minRating;
  if (Number.isFinite(maxRating) && maxRating > 0) cfg.MAX_RATING = maxRating;
  if (Number.isFinite(minReviews) && minReviews >= 0) cfg.MIN_REVIEWS_TOTAL = Math.floor(minReviews);

  cfg.SOFT_REVIEW_PENALTY = softPenaltyEnabled === "1" || softPenaltyEnabled.toLowerCase() === "true";
  cfg.PENALTY_REVIEWS_TARGET = Number.isFinite(penaltyReviewsTarget) && penaltyReviewsTarget > 0 ? penaltyReviewsTarget : 200;
  cfg.PENALTY_STRENGTH = Number.isFinite(penaltyStrength) && penaltyStrength >= 0 && penaltyStrength <= 1 ? penaltyStrength : 0.25;

  return cfg;
}

/**
 * Analyze offers using the "price priority" logic from nowa logika cen.txt.
 * Input offers format (from Dealsense): { seller, price, reviewScore, reviewCount, deliveryTime, url, ... }
 */
function analyzeOffersV2(offers, queryPrice, config = buildConfigFromEnv()) {
  const list = Array.isArray(offers) ? offers : [];

  if (!Number.isFinite(queryPrice) || queryPrice <= 0) {
    throw new Error("Invalid queryPrice");
  }

  const warnings = [];
  if (list.length < config.MIN_SHOPS) {
    warnings.push("Not enough shops from Google API");
  }

  // Map into the document's schema; we don't have pos/neg, so we approximate from reviewScore.
  const mapped = list
    .map((o) => {
      const shopName = typeof o.seller === "string" ? o.seller : "";
      const price = typeof o.price === "number" ? o.price : NaN;
      const ratingAvg = typeof o.reviewScore === "number" ? o.reviewScore : 0;
      const reviewsTotal = typeof o.reviewCount === "number" ? o.reviewCount : 0;
      const shippingTimeDays = o.deliveryTime;

      const ratingScore = clamp01(ratingAvg / 5);
      // Approx: treat ratingScore as ratio of positive sentiment.
      const reviewsPositive = Math.round(reviewsTotal * ratingScore);
      const reviewsNegative = Math.max(0, reviewsTotal - reviewsPositive);

      return {
        raw: o,
        shopName,
        price,
        ratingAvg,
        reviewsPositive,
        reviewsNegative,
        reviewsTotal,
        shippingTimeDays,
      };
    })
    .filter((s) => s.shopName && Number.isFinite(s.price) && s.price > 0);

  const qualityShops = mapped.filter(
    (s) =>
      s.ratingAvg >= config.MIN_RATING &&
      s.ratingAvg <= config.MAX_RATING &&
      s.reviewsTotal >= config.MIN_REVIEWS_TOTAL
  );

  if (qualityShops.length < config.MIN_SHOPS) {
    warnings.push("Not enough quality shops after filtering");
  }

  const effectiveSet = qualityShops.length > 0 ? qualityShops : mapped;
  if (effectiveSet.length === 0) {
    throw new Error("No usable offers");
  }

  const underQueryPrice = effectiveSet.filter((s) => s.price <= queryPrice);
  if (underQueryPrice.length === 0) {
    throw new Error("No shops under the query price that meet quality criteria");
  }

  const cheapestShop = underQueryPrice.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));

  const scored = effectiveSet
    .map((s) => {
      const denom = s.reviewsPositive + s.reviewsNegative;
      const reviewRatio = denom > 0 ? s.reviewsPositive / denom : clamp01(s.ratingAvg / 5);
      const ratingScore = clamp01(s.ratingAvg / 5);
      const baseScore = 0.6 * reviewRatio + 0.4 * ratingScore;
      let finalScore = baseScore;
      if (config && config.SOFT_REVIEW_PENALTY) {
        const target = Number(config.PENALTY_REVIEWS_TARGET) || 200;
        const strength = Number(config.PENALTY_STRENGTH);
        const safeStrength = Number.isFinite(strength) ? Math.max(0, Math.min(1, strength)) : 0.25;
        const reviews = Number.isFinite(s.reviewsTotal) ? Math.max(0, s.reviewsTotal) : 0;
        const coverage = clamp01(target > 0 ? reviews / target : 0);
        const penaltyFactor = (1 - safeStrength) + safeStrength * coverage;
        finalScore = baseScore * penaltyFactor;
      }
      return { ...s, reviewRatio, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  // Zasada: w "Marktoverzicht" nigdy nie pokazujemy ceny > queryPrice.
  const scoredUnderQuery = scored.filter((s) => s.price <= queryPrice);
  if (scoredUnderQuery.length === 0) {
    throw new Error("No shops under the query price that meet quality criteria");
  }

  // Zasada: zawsze zwracamy 3 oferty (o ile to możliwe) i nigdy nie pokazujemy ceny > queryPrice.
  // Składanie listy:
  // 1) najtańsza oferta <= queryPrice (priorytet)
  // 2) kolejne najlepsze jakościowo (score) <= queryPrice, bez duplikatów sprzedawcy
  const selected = [];
  const seenSellers = new Set();

  function pushUnique(s) {
    const seller = s && s.raw && typeof s.raw.seller === "string" ? s.raw.seller.trim().toLowerCase() : "";
    if (!seller) return false;
    if (seenSellers.has(seller)) return false;
    seenSellers.add(seller);
    selected.push(s);
    return true;
  }

  pushUnique(cheapestShop);
  for (const s of scoredUnderQuery) {
    if (selected.length >= 3) break;
    pushUnique(s);
  }

  const shortfall = Math.max(0, 3 - selected.length);

  // For backward compatibility with earlier response fields
  const best = scoredUnderQuery[0];

  return {
    displayOffers: selected.slice(0, 3).map((s) => s.raw),
    cheapestOffer: cheapestShop.raw,
    bestOfferByQuality: best ? best.raw : null,
    meta: {
      config,
      warnings,
      shortfall,
      inputOffers: list.length,
      mappedOffers: mapped.length,
      qualityOffers: qualityShops.length,
      underQueryPrice: underQueryPrice.length,
    },
  };
}

module.exports = {
  analyzeOffersV2,
};
