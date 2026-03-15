"use strict";

const { computeTitleMatchScore } = require("../scoring/match");

const DEFAULT_CONFIG = {
  MIN_SHOPS: 15,
  MIN_RATING: 3.8,
  MAX_RATING: 4.2,
  MIN_REVIEWS_TOTAL: 50,
  MIN_TITLE_MATCH_SCORE: 0.6,
  MIN_RELEVANCE_RATIO: 0.5,
  MIN_REVIEWS_ABS: 30,
  NICHE_MAX_REVIEWS: 200,
};

function clamp01(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function buildConfigFromEnv() {
  const cfg = { ...DEFAULT_CONFIG };

  const minShops = Number(process.env.PRICING_V3_MIN_SHOPS);
  const minRating = Number(process.env.PRICING_V3_MIN_RATING);
  const maxRating = Number(process.env.PRICING_V3_MAX_RATING);
  const minReviews = Number(process.env.PRICING_V3_MIN_REVIEWS_TOTAL);
  const minTitle = Number(process.env.PRICING_V3_MIN_TITLE_MATCH_SCORE);
  const minRatio = Number(process.env.PRICING_V3_MIN_RELEVANCE_RATIO);
  const minReviewsAbs = Number(process.env.PRICING_V3_MIN_REVIEWS_ABS);
  const nicheMaxReviews = Number(process.env.PRICING_V3_NICHE_MAX_REVIEWS);

  if (Number.isFinite(minShops) && minShops > 0) cfg.MIN_SHOPS = Math.floor(minShops);
  if (Number.isFinite(minRating) && minRating > 0) cfg.MIN_RATING = minRating;
  if (Number.isFinite(maxRating) && maxRating > 0) cfg.MAX_RATING = maxRating;
  if (Number.isFinite(minReviews) && minReviews >= 0) cfg.MIN_REVIEWS_TOTAL = Math.floor(minReviews);
  if (Number.isFinite(minTitle) && minTitle >= 0 && minTitle <= 1) cfg.MIN_TITLE_MATCH_SCORE = minTitle;
  if (Number.isFinite(minRatio) && minRatio > 0) cfg.MIN_RELEVANCE_RATIO = minRatio;
  if (Number.isFinite(minReviewsAbs) && minReviewsAbs >= 0) cfg.MIN_REVIEWS_ABS = Math.floor(minReviewsAbs);
  if (Number.isFinite(nicheMaxReviews) && nicheMaxReviews > 0) cfg.NICHE_MAX_REVIEWS = Math.floor(nicheMaxReviews);

  return cfg;
}

function analyzeOffersV3Strict(offers, queryPrice, queryText, config = buildConfigFromEnv()) {
  const list = Array.isArray(offers) ? offers : [];

  if (!Number.isFinite(queryPrice) || queryPrice <= 0) {
    throw new Error("Invalid queryPrice");
  }

  const warnings = [];
  if (list.length < config.MIN_SHOPS) {
    warnings.push("Not enough shops from market provider");
  }

  function runPass(passConfig) {
    const counters = {
      droppedInvalid: 0,
      droppedAboveOrEqualQuery: 0,
      droppedRelevanceRatio: 0,
      droppedTitleMatch: 0,
      droppedMinReviewsAbs: 0,
    };

    const mapped = list
      .map((o) => {
        const shopName = typeof o.seller === "string" ? o.seller : "";
        const price = typeof o.price === "number" ? o.price : NaN;
        const ratingAvg = typeof o.reviewScore === "number" ? o.reviewScore : 0;
        const reviewsTotal = typeof o.reviewCount === "number" ? o.reviewCount : 0;
        const shippingTimeDays = o.deliveryTime;
        const title = typeof o.title === "string" ? o.title : "";

        const sellerLower = String(shopName || "").trim().toLowerCase();
        const titleLower = String(title || "").trim().toLowerCase();
        const badSeller =
          sellerLower.includes("marktplaats") ||
          sellerLower.includes("ebay") ||
          sellerLower.includes("aliexpress") ||
          sellerLower.includes("temu") ||
          sellerLower.includes("vinted") ||
          sellerLower.includes("back market") ||
          sellerLower.includes("swappie") ||
          sellerLower.includes("refurbed") ||
          sellerLower.includes("rebuy") ||
          sellerLower.includes("asgoodasnew") ||
          sellerLower.includes("fix2new") ||
          sellerLower.includes("tradera") ||
          sellerLower.includes("hypeboost") ||
          sellerLower.includes("stockx") ||
          sellerLower.includes("goat") ||
          sellerLower.includes("ubuy") ||
          sellerLower.includes("amazon.nl - seller") ||
          sellerLower.includes("amazon marketplace");
        const badAccessory =
          titleLower.includes("hoes") ||
          titleLower.includes("case") ||
          titleLower.includes("cover") ||
          titleLower.includes("bescherm") ||
          titleLower.includes("screenprotector") ||
          titleLower.includes("band") ||
          titleLower.includes("batterij") ||
          titleLower.includes("replacement") ||
          titleLower.includes("onderdeel") ||
          titleLower.includes("accessoire") ||
          titleLower.includes("oorkap") ||
          titleLower.includes("hoofdband") ||
          titleLower.includes("hoesjes");
        const badUsed =
          titleLower.includes("refurb") ||
          titleLower.includes("tweedehands") ||
          titleLower.includes("gebruikt") ||
          titleLower.includes("renewed") ||
          titleLower.includes("pre-owned");

        if (!shopName || !Number.isFinite(price) || price <= 0) {
          counters.droppedInvalid += 1;
          return null;
        }

        if (badSeller || badAccessory || badUsed) {
          counters.droppedTitleMatch += 1;
          return null;
        }

        // Core rule: never accept an offer priced above (or equal to) the base/query price.
        // (Query price is the base price for the current product.)
        if (!(price < queryPrice)) {
          counters.droppedAboveOrEqualQuery += 1;
          return null;
        }

        const priceRatio = queryPrice > 0 ? price / queryPrice : 0;

        if (!(priceRatio >= passConfig.MIN_RELEVANCE_RATIO)) {
          counters.droppedRelevanceRatio += 1;
          return null;
        }

        const q = typeof queryText === "string" ? queryText.trim() : "";
        const titleScore = q ? computeTitleMatchScore(q, title) : 0;
        if (q && !(titleScore >= passConfig.MIN_TITLE_MATCH_SCORE)) {
          counters.droppedTitleMatch += 1;
          return null;
        }

        if (!(reviewsTotal >= passConfig.MIN_REVIEWS_ABS)) {
          counters.droppedMinReviewsAbs += 1;
          return null;
        }

        const ratingScore = clamp01(ratingAvg / 5);
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
          _titleScore: titleScore,
        };
      })
      .filter(Boolean);

    const qualityShops = mapped.filter(
      (s) =>
        s.ratingAvg >= passConfig.MIN_RATING &&
        s.ratingAvg <= passConfig.MAX_RATING &&
        s.reviewsTotal >= passConfig.MIN_REVIEWS_TOTAL
    );

    const passWarnings = [];
    if (qualityShops.length < passConfig.MIN_SHOPS) {
      passWarnings.push("Not enough quality shops after filtering");
    }

    const effectiveSet = qualityShops.length > 0 ? qualityShops : mapped;
    if (effectiveSet.length === 0) {
      return {
        selected: [],
        shortfall: 3,
        counters,
        mappedOffers: mapped.length,
        qualityOffers: qualityShops.length,
        underQueryPrice: 0,
        warnings: passWarnings,
      };
    }

    const scored = effectiveSet
      .map((s) => {
        const denom = s.reviewsPositive + s.reviewsNegative;
        const reviewRatio = denom > 0 ? s.reviewsPositive / denom : clamp01(s.ratingAvg / 5);
        const ratingScore = clamp01(s.ratingAvg / 5);
        const finalScore = 0.6 * reviewRatio + 0.4 * ratingScore;
        return { ...s, reviewRatio, finalScore };
      })
      .sort((a, b) => b.finalScore - a.finalScore);

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

    const GIANTS = [
      "bol",
      "bol.com",
      "coolblue",
      "mediamarkt",
      "amazon.nl",
      "amazon",
      "bcc",
      "wehkamp",
      "expert",
      "blokker",
      "intertoys",
      "fonq",
      "decathlon",
      "zalando",
      "wehkamp",
      "gamma",
    ];

    function isGiant(s) {
      const seller = s && s.raw && typeof s.raw.seller === "string" ? s.raw.seller.trim().toLowerCase() : "";
      if (!seller) return false;
      return GIANTS.some((g) => seller === g || seller.includes(g));
    }

    function isNiche(s) {
      const n = s && typeof s.reviewsTotal === "number" ? s.reviewsTotal : 0;
      return n >= passConfig.MIN_REVIEWS_ABS && n < passConfig.NICHE_MAX_REVIEWS;
    }

    const giants = scored.filter((s) => isGiant(s));
    const niche = scored.filter((s) => !isGiant(s) && isNiche(s));
    const other = scored.filter((s) => !isGiant(s) && !isNiche(s));

    const cheapestOverall = effectiveSet.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
    pushUnique(cheapestOverall);

    // 50/50 rule (best-effort): try to include at least 1 giant and 1 niche (when data allows).
    const hasGiant = () => selected.some((x) => isGiant(x));
    const hasNiche = () => selected.some((x) => isNiche(x) && !isGiant(x));

    if (!hasGiant()) {
      for (const s of giants) {
        if (selected.length >= 3) break;
        pushUnique(s);
      }
    }

    if (!hasNiche()) {
      for (const s of niche) {
        if (selected.length >= 3) break;
        pushUnique(s);
      }
    }

    // Fill remaining slots: prefer the best scored from niche first (if we already have a giant), then others.
    const fillPools = [niche, giants, other, scored];
    for (const pool of fillPools) {
      for (const s of pool) {
        if (selected.length >= 3) break;
        pushUnique(s);
      }
      if (selected.length >= 3) break;
    }

    const shortfall = Math.max(0, 3 - selected.length);
    return {
      selected,
      shortfall,
      counters,
      mappedOffers: mapped.length,
      qualityOffers: qualityShops.length,
      underQueryPrice: effectiveSet.length,
      warnings: passWarnings,
    };
  }

  const strictPass = runPass(config);
  if (strictPass.shortfall === 0) {
    return {
      displayOffers: strictPass.selected.slice(0, 3).map((s) => s.raw),
      meta: {
        config,
        warnings: [...warnings, ...strictPass.warnings],
        counters: strictPass.counters,
        shortfall: 0,
        inputOffers: list.length,
        mappedOffers: strictPass.mappedOffers,
        qualityOffers: strictPass.qualityOffers,
        underQueryPrice: strictPass.underQueryPrice,
        usedFallback15: false,
        usedPass: "strict",
        strict: {
          mappedOffers: strictPass.mappedOffers,
          qualityOffers: strictPass.qualityOffers,
          underQueryPrice: strictPass.underQueryPrice,
          shortfall: strictPass.shortfall,
          counters: strictPass.counters,
        },
      },
    };
  }

  // Relax additional parameters by 15% only when strict cannot pick exactly 3.
  const relaxedConfig = {
    ...config,
    MIN_TITLE_MATCH_SCORE: Math.max(0, Math.min(1, config.MIN_TITLE_MATCH_SCORE * 0.85)),
    MIN_RELEVANCE_RATIO: Math.max(0, config.MIN_RELEVANCE_RATIO * 0.85),
    MIN_REVIEWS_ABS: Math.max(0, Math.floor(config.MIN_REVIEWS_ABS * 0.85)),
  };

  const relaxedPass = runPass(relaxedConfig);
  if (relaxedPass.shortfall === 0) {
    return {
      displayOffers: relaxedPass.selected.slice(0, 3).map((s) => s.raw),
      meta: {
        config: relaxedConfig,
        warnings: [...warnings, ...relaxedPass.warnings],
        counters: relaxedPass.counters,
        shortfall: 0,
        inputOffers: list.length,
        mappedOffers: relaxedPass.mappedOffers,
        qualityOffers: relaxedPass.qualityOffers,
        underQueryPrice: relaxedPass.underQueryPrice,
        usedFallback15: true,
        strictShortfall: strictPass.shortfall,
        usedPass: "fallback15",
        strict: {
          mappedOffers: strictPass.mappedOffers,
          qualityOffers: strictPass.qualityOffers,
          underQueryPrice: strictPass.underQueryPrice,
          shortfall: strictPass.shortfall,
          counters: strictPass.counters,
        },
        fallback15: {
          mappedOffers: relaxedPass.mappedOffers,
          qualityOffers: relaxedPass.qualityOffers,
          underQueryPrice: relaxedPass.underQueryPrice,
          shortfall: relaxedPass.shortfall,
          counters: relaxedPass.counters,
        },
      },
    };
  }

  // Ultra-relaxed last resort: keep anti-junk filters, but prefer returning 3 offers if possible.
  const ultraConfig = {
    ...config,
    MIN_SHOPS: 1,
    MIN_REVIEWS_TOTAL: 0,
    MIN_RATING: 0,
    MAX_RATING: 5,
    MIN_TITLE_MATCH_SCORE: Math.max(0, Math.min(1, config.MIN_TITLE_MATCH_SCORE * 0.4)),
    MIN_RELEVANCE_RATIO: Math.max(0, config.MIN_RELEVANCE_RATIO * 0.4),
    MIN_REVIEWS_ABS: 0,
  };

  const ultraPass = runPass(ultraConfig);
  if (ultraPass.selected.length > 0) {
    return {
      displayOffers: ultraPass.selected.slice(0, 3).map((s) => s.raw),
      meta: {
        config: ultraConfig,
        warnings: [...warnings, ...ultraPass.warnings],
        counters: ultraPass.counters,
        shortfall: Math.max(0, 3 - ultraPass.selected.length),
        inputOffers: list.length,
        mappedOffers: ultraPass.mappedOffers,
        qualityOffers: ultraPass.qualityOffers,
        underQueryPrice: ultraPass.underQueryPrice,
        usedFallback15: true,
        strictShortfall: strictPass.shortfall,
        relaxedShortfall: relaxedPass.shortfall,
        usedPass: "ultra",
        strict: {
          mappedOffers: strictPass.mappedOffers,
          qualityOffers: strictPass.qualityOffers,
          underQueryPrice: strictPass.underQueryPrice,
          shortfall: strictPass.shortfall,
          counters: strictPass.counters,
        },
        fallback15: {
          mappedOffers: relaxedPass.mappedOffers,
          qualityOffers: relaxedPass.qualityOffers,
          underQueryPrice: relaxedPass.underQueryPrice,
          shortfall: relaxedPass.shortfall,
          counters: relaxedPass.counters,
        },
        ultra: {
          mappedOffers: ultraPass.mappedOffers,
          qualityOffers: ultraPass.qualityOffers,
          underQueryPrice: ultraPass.underQueryPrice,
          shortfall: ultraPass.shortfall,
          counters: ultraPass.counters,
        },
      },
    };
  }

  return {
    displayOffers: [],
    meta: {
      config,
      warnings: [...warnings, ...strictPass.warnings],
      counters: strictPass.counters,
      shortfall: strictPass.shortfall,
      inputOffers: list.length,
      mappedOffers: strictPass.mappedOffers,
      qualityOffers: strictPass.qualityOffers,
      underQueryPrice: strictPass.underQueryPrice,
      usedFallback15: false,
      strictShortfall: strictPass.shortfall,
      relaxedShortfall: relaxedPass.shortfall,
      usedPass: "none",
      strict: {
        mappedOffers: strictPass.mappedOffers,
        qualityOffers: strictPass.qualityOffers,
        underQueryPrice: strictPass.underQueryPrice,
        shortfall: strictPass.shortfall,
        counters: strictPass.counters,
      },
      fallback15: {
        mappedOffers: relaxedPass.mappedOffers,
        qualityOffers: relaxedPass.qualityOffers,
        underQueryPrice: relaxedPass.underQueryPrice,
        shortfall: relaxedPass.shortfall,
        counters: relaxedPass.counters,
      },
    },
  };
}

module.exports = {
  analyzeOffersV3Strict,
};
