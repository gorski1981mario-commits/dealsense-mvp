"use strict";

/**
 * ROTATION ENGINE - Twój Magic!
 * 
 * 40% top deals
 * 30% niche deals
 * 20% fresh deals
 * 10% experiment (random)
 * 
 * User NIE widzi zawsze tych samych 3 sklepów!
 * Każdy scan = RÓŻNE sklepy (ale zawsze dobre!)
 */

const { isNicheShop } = require('./trustEngine');
const { rotateDealsAntiPattern } = require('../lib/antiPatternRotation');
const { rotateMathematical, getRotationStats: getMathRotationStats } = require('../lib/mathematicalRotation');

/**
 * Sprawdza czy oferta jest świeża (< 24h)
 */
function isFresh(offer) {
  if (!offer || typeof offer !== 'object') return false;
  
  const firstSeen = offer.firstSeen || offer._firstSeen || offer.timestamp;
  if (!firstSeen) return false;
  
  const age = Date.now() - new Date(firstSeen).getTime();
  const hours24 = 24 * 60 * 60 * 1000;
  
  return age < hours24;
}

/**
 * Sortuje oferty po deal score (malejąco)
 */
function sortByDealScore(offers) {
  if (!Array.isArray(offers)) return [];
  
  return offers.slice().sort((a, b) => {
    const scoreA = a._dealScore?.dealScore || 0;
    const scoreB = b._dealScore?.dealScore || 0;
    return scoreB - scoreA;
  });
}

/**
 * Filtruje niszowe oferty
 */
function filterNiche(offers) {
  if (!Array.isArray(offers)) return [];
  return offers.filter(o => isNicheShop(o));
}

/**
 * Filtruje świeże oferty
 */
function filterFresh(offers) {
  if (!Array.isArray(offers)) return [];
  return offers.filter(o => isFresh(o));
}

/**
 * Losuje N elementów z array
 */
function randomSample(array, n) {
  if (!Array.isArray(array) || array.length === 0) return [];
  if (n >= array.length) return array.slice();
  
  const shuffled = array.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Rotacja ofert - 2 TRYBY
 * 
 * @param {Array} offers - Oferty z _dealScore
 * @param {Object} options - Opcje rotacji
 * @returns {Array} Zrotowane oferty
 */
function rotateDeals(offers, options = {}) {
  if (!Array.isArray(offers) || offers.length === 0) return [];
  
  const {
    maxResults = 30,
    enableRotation = true,
    enableAntiPattern = true,
    userId = null,
    productName = '',
    scanCount = 0
  } = options;
  
  // Jeśli rotacja wyłączona → zwróć top deals
  if (!enableRotation) {
    return sortByDealScore(offers).slice(0, maxResults);
  }
  
  // TRYB 0: MATHEMATICAL ROTATION (ENTERPRISE - PRIORYTET!)
  const enableMathematical = options.enableMathematical !== false;
  
  if (enableMathematical && userId && productName) {
    return rotateMathematical(offers, {
      userId,
      productName,
      maxResults
    });
  }
  
  // TRYB 1: ANTI-PATTERN ROTATION (fallback jeśli mathematical wyłączony)
  if (enableAntiPattern && userId && productName) {
    return rotateDealsAntiPattern(offers, {
      userId,
      productName,
      scanCount,
      maxResults,
      avoidLastNScans: 10
    });
  }
  
  // TRYB 2: STANDARD ROTATION (fallback)
  
  // Sortuj wszystkie oferty
  const sorted = sortByDealScore(offers);
  
  // Oblicz ile z każdej kategorii
  const topCount = Math.floor(maxResults * 0.4);      // 40%
  const nicheCount = Math.floor(maxResults * 0.3);    // 30%
  const freshCount = Math.floor(maxResults * 0.2);    // 20%
  const experimentCount = maxResults - topCount - nicheCount - freshCount; // 10% (reszta)
  
  const result = [];
  const used = new Set();
  
  // 1. Top deals (40%)
  const topDeals = sorted.slice(0, topCount * 2); // Bierzemy więcej żeby mieć wybór
  for (const offer of topDeals) {
    if (result.length >= topCount) break;
    const sellerKey = (offer.seller || '').toLowerCase().trim();
    if (!used.has(sellerKey)) {
      result.push({ ...offer, _category: 'top' });
      used.add(sellerKey);
    }
  }
  
  // 2. Niche deals (30%)
  const nicheDeals = filterNiche(sorted.filter(o => {
    const sellerKey = (o.seller || '').toLowerCase().trim();
    return !used.has(sellerKey);
  }));
  
  for (const offer of nicheDeals) {
    if (result.length >= topCount + nicheCount) break;
    const sellerKey = (offer.seller || '').toLowerCase().trim();
    if (!used.has(sellerKey)) {
      result.push({ ...offer, _category: 'niche' });
      used.add(sellerKey);
    }
  }
  
  // 3. Fresh deals (20%)
  const freshDeals = filterFresh(sorted.filter(o => {
    const sellerKey = (o.seller || '').toLowerCase().trim();
    return !used.has(sellerKey);
  }));
  
  for (const offer of freshDeals) {
    if (result.length >= topCount + nicheCount + freshCount) break;
    const sellerKey = (offer.seller || '').toLowerCase().trim();
    if (!used.has(sellerKey)) {
      result.push({ ...offer, _category: 'fresh' });
      used.add(sellerKey);
    }
  }
  
  // 4. Experiment (10% - random)
  const remaining = sorted.filter(o => {
    const sellerKey = (o.seller || '').toLowerCase().trim();
    return !used.has(sellerKey);
  });
  
  const experiments = randomSample(remaining, experimentCount);
  experiments.forEach(offer => {
    const sellerKey = (offer.seller || '').toLowerCase().trim();
    if (!used.has(sellerKey)) {
      result.push({ ...offer, _category: 'experiment' });
      used.add(sellerKey);
    }
  });
  
  // Jeśli nie mamy wystarczająco → dołóż z sorted (top deals)
  if (result.length < maxResults) {
    for (const offer of sorted) {
      if (result.length >= maxResults) break;
      const sellerKey = (offer.seller || '').toLowerCase().trim();
      if (!used.has(sellerKey)) {
        result.push({ ...offer, _category: 'filler' });
        used.add(sellerKey);
      }
    }
  }
  
  return result.slice(0, maxResults);
}

/**
 * Statystyki rotacji
 */
function getRotationStats(rotatedOffers) {
  if (!Array.isArray(rotatedOffers)) return {};
  
  const stats = {
    total: rotatedOffers.length,
    top: 0,
    niche: 0,
    fresh: 0,
    experiment: 0,
    filler: 0
  };
  
  rotatedOffers.forEach(offer => {
    const category = offer._category || 'unknown';
    if (stats[category] !== undefined) {
      stats[category]++;
    }
  });
  
  return stats;
}

module.exports = {
  rotateDeals,
  getRotationStats,
  isFresh,
  sortByDealScore,
  filterNiche,
  filterFresh
};
