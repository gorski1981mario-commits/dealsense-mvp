"use strict";

/**
 * DEAL SCORE V2 - KOMPLETNY SYSTEM
 * 
 * Integruje wszystkie komponenty:
 * - Reference Price Engine
 * - Trust Engine
 * - Long-tail Boost
 * - Freshness Hack
 * - Rotation Engine
 */

const { getReferencePrice, getMarketAverage, isPriceOutlier } = require('./referencePrice');
const { getTrustScore, isTrusted, isNicheShop } = require('./trustEngine');
const { isFresh } = require('./rotationEngine');

/**
 * Oblicza Deal Score dla pojedynczej oferty
 * 
 * @param {Object} offer - Oferta z ceną, rating, reviews, etc
 * @param {number} referencePrice - Reference price (z getReferencePrice)
 * @param {number} marketAvg - Market average (z getMarketAverage)
 * @param {Object} options - Opcje scoringu
 * @returns {Object} Deal score object
 */
function calculateDealScore(offer, referencePrice, marketAvg, options = {}) {
  const DEBUG = options.debug || false;
  const seller = offer?.seller || 'Unknown';
  
  if (!offer || typeof offer !== 'object') {
    if (DEBUG) console.log(`[DEBUG] ${seller}: BLOCKED - Invalid offer`);
    return {
      dealScore: 0,
      dealConfidence: 'laag',
      trustScore: 0,
      savings: 0,
      savingsPercent: 0,
      isNiche: false,
      isFresh: false,
      isTrusted: false,
      blocked: true,
      blockReason: 'Invalid offer'
    };
  }
  
  const price = typeof offer.price === 'number' ? offer.price : 0;
  
  // Validation
  if (price <= 0) {
    if (DEBUG) console.log(`[DEBUG] ${seller}: BLOCKED - Invalid price (${price})`);
    return {
      dealScore: 0,
      dealConfidence: 'laag',
      trustScore: 0,
      savings: 0,
      savingsPercent: 0,
      isNiche: false,
      isFresh: false,
      isTrusted: false,
      blocked: true,
      blockReason: 'Invalid price'
    };
  }
  
  if (!referencePrice || referencePrice <= 0) {
    if (DEBUG) console.log(`[DEBUG] ${seller}: BLOCKED - No reference price (ref: ${referencePrice}, price: €${price})`);
    return {
      dealScore: 0,
      dealConfidence: 'laag',
      trustScore: 0,
      savings: 0,
      savingsPercent: 0,
      isNiche: false,
      isFresh: false,
      isTrusted: false,
      blocked: true,
      blockReason: 'No reference price'
    };
  }
  
  // 1. Trust Score (MUST PASS!)
  const trustScore = getTrustScore(offer);
  const trusted = isTrusted(offer);
  
  if (!trusted) {
    if (DEBUG) console.log(`[DEBUG] ${seller}: BLOCKED - Trust too low (${trustScore}/100, min 30, price: €${price})`);
    return {
      dealScore: 0,
      dealConfidence: 'laag',
      trustScore: trustScore,
      savings: 0,
      savingsPercent: 0,
      isNiche: false,
      isFresh: false,
      isTrusted: false,
      blocked: true,
      blockReason: `Trust score too low (${trustScore}/100, min 30)`
    };
  }
  
  // 2. Price outlier check
  if (marketAvg && isPriceOutlier(price, [{ price: marketAvg }])) {
    if (DEBUG) console.log(`[DEBUG] ${seller}: BLOCKED - Price outlier (price: €${price}, marketAvg: €${marketAvg})`);
    return {
      dealScore: 0,
      dealConfidence: 'laag',
      trustScore: trustScore,
      savings: 0,
      savingsPercent: 0,
      isNiche: false,
      isFresh: false,
      isTrusted: true,
      blocked: true,
      blockReason: 'Price outlier (suspiciously low/high)'
    };
  }
  
  // 3. Base savings
  const savings = referencePrice - price;
  const savingsPercent = (savings / referencePrice) * 100;
  
  // Tylko oferty tańsze niż reference!
  if (savings <= 0) {
    if (DEBUG) console.log(`[DEBUG] ${seller}: BLOCKED - Not cheaper (price: €${price}, ref: €${referencePrice}, savings: €${savings})`);
    return {
      dealScore: 0,
      dealConfidence: 'laag',
      trustScore: trustScore,
      savings: 0,
      savingsPercent: 0,
      isNiche: false,
      isFresh: false,
      isTrusted: true,
      blocked: true,
      blockReason: 'Not cheaper than reference'
    };
  }
  
  if (DEBUG) console.log(`[DEBUG] ${seller}: ✅ PASSED (price: €${price}, ref: €${referencePrice}, trust: ${trustScore}, savings: ${savingsPercent.toFixed(1)}%)`);
  
  // 4. Base score (0-10)
  let score = 0;
  if (savingsPercent >= 15) score = 9;
  else if (savingsPercent >= 10) score = 8;
  else if (savingsPercent >= 7) score = 7;
  else if (savingsPercent >= 5) score = 6;
  else if (savingsPercent >= 3) score = 5;
  else if (savingsPercent >= 1) score = 4;
  else score = 3;
  
  // 5. Niche boost (+20-40%)
  const niche = isNicheShop(offer);
  if (niche && trusted) {
    const boost = savingsPercent * 0.3; // 30% boost
    score += boost;
  }
  
  // 6. Freshness boost (+15%)
  const fresh = isFresh(offer);
  if (fresh) {
    score += 1.5;
  }
  
  // 7. Delivery penalty
  const deliveryDays = typeof offer.deliveryTime === 'number' ? offer.deliveryTime : null;
  if (deliveryDays !== null && deliveryDays > 3) {
    score -= 0.5;
  }
  
  // 8. Trust bonus (high trust = slight boost)
  if (trustScore >= 80) {
    score += 0.5;
  }
  
  // Cap score 0-10
  score = Math.min(10, Math.max(0, score));
  
  // 9. Confidence (based on offer count - will be set later)
  const confidence = 'medium'; // Default, will be updated in getDealScores
  
  return {
    dealScore: Math.round(score * 10) / 10, // Round to 1 decimal
    dealConfidence: confidence,
    trustScore: trustScore,
    savings: Math.round(savings * 100) / 100,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
    isNiche: niche,
    isFresh: fresh,
    isTrusted: trusted,
    blocked: false,
    blockReason: null
  };
}

/**
 * Oblicza Deal Scores dla wszystkich ofert
 * 
 * @param {Array} offers - Array ofert
 * @param {number} userBasePrice - Cena podana przez usera (opcjonalna)
 * @param {Object} options - Opcje
 * @returns {Array} Oferty z _dealScore
 */
function getDealScores(offers, userBasePrice = null, options = {}) {
  if (!Array.isArray(offers) || offers.length === 0) {
    return [];
  }
  
  const filterBlocked = options.filterBlocked !== false;
  const DEBUG = options.debug || false;
  
  // 1. Oblicz reference price (mediana z ofert + user base price)
  const referencePrice = getReferencePrice(offers, userBasePrice);
  const marketAvg = getMarketAverage(offers);
  
  if (DEBUG) {
    console.log(`\n[DEBUG] ========== DEALSCORE V2 DEBUG ==========`);
    console.log(`[DEBUG] Offers count: ${offers.length}`);
    console.log(`[DEBUG] User base price: €${userBasePrice}`);
    console.log(`[DEBUG] Reference price: €${referencePrice}`);
    console.log(`[DEBUG] Market average: €${marketAvg}`);
    console.log(`[DEBUG] Filter blocked: ${filterBlocked}`);
    console.log(`[DEBUG] ==========================================\n`);
  }
  
  if (!referencePrice) {
    console.log('[DealScoreV2] No reference price available');
    return offers.map(o => ({
      ...o,
      _dealScore: {
        dealScore: 0,
        dealConfidence: 'laag',
        trustScore: 0,
        savings: 0,
        savingsPercent: 0,
        isNiche: false,
        isFresh: false,
        isTrusted: false,
        blocked: true,
        blockReason: 'No reference price'
      }
    }));
  }
  
  // 2. Oblicz deal score dla każdej oferty
  const scored = offers.map(offer => {
    const dealScore = calculateDealScore(offer, referencePrice, marketAvg, { debug: DEBUG });
    return {
      ...offer,
      _dealScore: dealScore
    };
  });
  
  const validOffers = scored.filter(o => !o._dealScore.blocked);
  const offerCount = validOffers.length;
  
  const confidence = offerCount >= 10 ? 'hoog' : offerCount >= 3 ? 'medium' : 'laag';
  
  scored.forEach(offer => {
    if (offer._dealScore) {
      offer._dealScore.dealConfidence = confidence;
    }
  });
  
  // 4. Filtruj zablokowane oferty (opcjonalne)
  if (filterBlocked) {
    return scored.filter(o => !o._dealScore.blocked);
  }
  
  return scored;
}

/**
 * Znajduje best deal (najwyższy score)
 */
function getBestDeal(offers) {
  if (!Array.isArray(offers) || offers.length === 0) return null;
  
  const valid = offers.filter(o => o._dealScore && !o._dealScore.blocked);
  if (valid.length === 0) return null;
  
  return valid.reduce((best, current) => {
    const bestScore = best._dealScore?.dealScore || 0;
    const currentScore = current._dealScore?.dealScore || 0;
    return currentScore > bestScore ? current : best;
  });
}

/**
 * Statystyki deal scores
 */
function getDealScoreStats(offers) {
  if (!Array.isArray(offers) || offers.length === 0) {
    return {
      total: 0,
      valid: 0,
      blocked: 0,
      avgScore: 0,
      avgSavings: 0,
      avgSavingsPercent: 0,
      nicheCount: 0,
      freshCount: 0,
      trustedCount: 0
    };
  }
  
  const valid = offers.filter(o => o._dealScore && !o._dealScore.blocked);
  const blocked = offers.filter(o => o._dealScore && o._dealScore.blocked);
  
  const avgScore = valid.length > 0
    ? valid.reduce((sum, o) => sum + (o._dealScore.dealScore || 0), 0) / valid.length
    : 0;
  
  const avgSavings = valid.length > 0
    ? valid.reduce((sum, o) => sum + (o._dealScore.savings || 0), 0) / valid.length
    : 0;
  
  const avgSavingsPercent = valid.length > 0
    ? valid.reduce((sum, o) => sum + (o._dealScore.savingsPercent || 0), 0) / valid.length
    : 0;
  
  const nicheCount = valid.filter(o => o._dealScore.isNiche).length;
  const freshCount = valid.filter(o => o._dealScore.isFresh).length;
  const trustedCount = valid.filter(o => o._dealScore.isTrusted).length;
  
  return {
    total: offers.length,
    valid: valid.length,
    blocked: blocked.length,
    avgScore: Math.round(avgScore * 10) / 10,
    avgSavings: Math.round(avgSavings * 100) / 100,
    avgSavingsPercent: Math.round(avgSavingsPercent * 10) / 10,
    nicheCount,
    freshCount,
    trustedCount
  };
}

module.exports = {
  calculateDealScore,
  getDealScores,
  getBestDeal,
  getDealScoreStats
};
