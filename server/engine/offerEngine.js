"use strict";

const { fetchMarketOffers } = require("../market-api");
const { analyzeOffersV2 } = require("../pricing/v2");
const { isScam } = require("../scoring/isScam");
const { computeTitleMatchScore } = require("../scoring/match");
const {
  dedupeOffersForSelection,
  pickTopUniqueSellers,
  sortOffersByPriceAndPopularity,
} = require("../scoring/selection");
const {
  normalizeOfferDeliveryDays,
  filterByMaxDeliveryDays,
} = require("../scoring/delivery");

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function computeMarketAvg(offers, basePrice) {
  const base = Number(basePrice) || 0;
  const relevant = (Array.isArray(offers) ? offers : []).filter((o) => {
    if (base <= 0) return true;
    const p = o && typeof o.price === "number" ? o.price : NaN;
    if (!Number.isFinite(p) || p <= 0) return false;
    const ratio = p / base;
    return ratio >= 0.5 && ratio <= 2.0;
  });
  if (relevant.length === 0) return base;
  return relevant.reduce((s, o) => s + o.price, 0) / relevant.length;
}

async function getTop3EchoOffers(input) {
  const base_price = Number(input.base_price);
  const product_name = input.product_name || "";
  const ean = input.ean || null;

  const marketOffers = await fetchMarketOffers(product_name, ean);
  const normalized = (Array.isArray(marketOffers) ? marketOffers : []).map((o) => normalizeOfferDeliveryDays(o));

  const marketAvg = computeMarketAvg(normalized, base_price);

  const annotated = normalized.map((o) => {
    const scam = isScam(o, marketAvg);
    const titleScore = product_name ? computeTitleMatchScore(product_name, (o && o.title) || "") : 0;
    return {
      ...o,
      scam,
      _titleScore: titleScore,
    };
  });

  const nonScam = annotated.filter((o) => !o.scam);
  const inStock = nonScam.filter((o) => (o && o.availability) === "in_stock");
  const underBase = inStock.filter((o) => typeof o.price === "number" && o.price <= base_price);

  const matchMinScore = input.matchMinScore != null ? Number(input.matchMinScore) : null;
  const afterMatch =
    matchMinScore != null && product_name
      ? underBase.filter((o) => (o._titleScore || 0) >= matchMinScore)
      : underBase;

  const maxDeliveryDays = input.maxDeliveryDays != null ? Number(input.maxDeliveryDays) : null;
  const afterDelivery =
    maxDeliveryDays != null && maxDeliveryDays > 0 ? filterByMaxDeliveryDays(afterMatch, maxDeliveryDays) : afterMatch;

  const deduped = dedupeOffersForSelection(afterDelivery);

  const fallbackSorted = sortOffersByPriceAndPopularity(deduped);
  let offersForClient = pickTopUniqueSellers(fallbackSorted, 3);

  let usedPricingV2 = false;
  let pricingV2Error = null;
  try {
    const v2 = analyzeOffersV2(deduped, base_price);
    if (v2 && Array.isArray(v2.displayOffers) && v2.displayOffers.length > 0) {
      offersForClient = pickTopUniqueSellers(
        v2.displayOffers.filter((o) => o && o.price != null && o.price <= base_price && o.availability === "in_stock"),
        3
      );
      usedPricingV2 = offersForClient.length > 0;
    }
  } catch (e) {
    pricingV2Error = (e && e.message) || "pricing_v2_error";
  }

  const cleaned = offersForClient.map((o) => {
    const out = { ...o };
    delete out._titleScore;
    return out;
  });

  const best = cleaned.length > 0 ? sortOffersByPriceAndPopularity(cleaned)[0] : null;
  const savings = best && typeof best.price === "number" ? round2(base_price - best.price) : 0;

  const meta = {
    inputOffers: normalized.length,
    nonScamOffers: nonScam.length,
    inStockOffers: inStock.length,
    underBaseOffers: underBase.length,
    afterMatchOffers: afterMatch.length,
    afterDeliveryOffers: afterDelivery.length,
    dedupedOffers: deduped.length,
    returnedOffers: cleaned.length,
    shortfall: Math.max(0, 3 - cleaned.length),
    usedPricingV2,
    pricingV2Error,
    marketAvg: round2(marketAvg),
  };

  return {
    ok: true,
    base_price,
    savings,
    offers: cleaned,
    meta,
  };
}

module.exports = {
  getTop3EchoOffers,
};
