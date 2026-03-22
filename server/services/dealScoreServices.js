"use strict";

/**
 * DEAL SCORE FOR SERVICES (USŁUGI)
 * 
 * Główny silnik scoringu dla konfiguratorów (Energy, Telecom, Insurance, etc)
 * 
 * FLOW:
 * 1. User input (3-4 pola) → AI enrichment
 * 2. Smart query generation (1-3 queries MAX)
 * 3. Market scan (20-80 ofert)
 * 4. Cheap but good filter
 * 5. Deal Score calculation (category-specific weights)
 * 6. Rotation (40/30/20/10)
 * 7. Final output (TOP 3-5)
 */

const { enrichProfile, fallbackEnrichment } = require('./profileEnrichment');
const { generateServiceQueries, generateAlternativeQueries } = require('./serviceQueryGenerator');
const { filterCheapButGood, filterScamOffers, getOfferQuality, getConfidenceScore, getPriceVolatility } = require('./qualityFilter');
const { getCategoryWeights, getQualityThreshold, getCacheTTL, getMaxQueries, getResultPoolSize } = require('./categoryConfig');

/**
 * Oblicza Deal Score dla usługi
 * 
 * @param {Object} offer - Oferta
 * @param {string} category - Kategoria
 * @param {Object} enrichedProfile - Enriched profile
 * @returns {Object} Deal score data
 */
function calculateServiceDealScore(offer, category, enrichedProfile) {
  const weights = getCategoryWeights(category);
  
  // 1. Price score (0-10)
  const priceScore = calculatePriceScore(offer, enrichedProfile);
  
  // 2. Quality score (0-10)
  const qualityScore = getOfferQuality(offer);
  
  // 3. Fit score (0-10) - dopasowanie do potrzeb usera
  const fitScore = calculateFitScore(offer, enrichedProfile, category);
  
  // 4. Trust score (0-10)
  const trustScore = calculateTrustScore(offer) / 10; // 0-100 → 0-10
  
  // 5. Freshness score (0-10)
  const freshnessScore = calculateFreshnessScore(offer);
  
  // DEAL SCORE FORMULA (category-specific weights)
  const dealScore = 
    (weights.price * priceScore) +
    (weights.quality * qualityScore) +
    (weights.fit * fitScore) +
    (weights.trust * trustScore) +
    (weights.freshness * freshnessScore);
  
  return {
    dealScore: Math.min(10, Math.max(0, dealScore)),
    priceScore,
    qualityScore,
    fitScore,
    trustScore: trustScore * 10, // Back to 0-100
    freshnessScore,
    weights,
    confidence: getOfferConfidence(offer, qualityScore)
  };
}

/**
 * Price score (0-10)
 * 
 * Im niższa cena vs budget → wyższy score
 */
function calculatePriceScore(offer, enrichedProfile) {
  const price = offer.price || 0;
  const budget = enrichedProfile.budget || price;
  
  if (budget <= 0 || price <= 0) return 5.0;
  
  // Savings percentage
  const savings = ((budget - price) / budget) * 100;
  
  // Score mapping:
  // -20% (drożej) = 0
  // 0% (równo) = 5
  // +20% (taniej) = 8
  // +40% (bardzo taniej) = 10
  
  if (savings >= 40) return 10.0;
  if (savings >= 20) return 8.0 + ((savings - 20) / 20) * 2; // 8-10
  if (savings >= 0) return 5.0 + (savings / 20) * 3; // 5-8
  if (savings >= -20) return 5.0 + (savings / 20) * 5; // 0-5
  return 0;
}

/**
 * Fit score (0-10)
 * 
 * Jak dobrze oferta pasuje do potrzeb usera
 */
function calculateFitScore(offer, enrichedProfile, category) {
  let fitScore = 5.0; // Base
  
  const preferences = enrichedProfile.preferences || {};
  
  switch (category) {
    case 'vacation':
      // Check preferences match
      if (preferences.beachfront && offer.beachfront) fitScore += 2;
      if (preferences.cityCenter && offer.cityCenter) fitScore += 2;
      if (preferences.spa && offer.spa) fitScore += 1;
      if (preferences.familyFriendly && offer.familyFriendly) fitScore += 1;
      if (preferences.allInclusive && offer.allInclusive) fitScore += 2;
      break;
    
    case 'energy':
      if (preferences.green && offer.green) fitScore += 3;
      if (preferences.fixed && offer.fixedPrice) fitScore += 2;
      break;
    
    case 'telecom':
      if (preferences.unlimited && offer.unlimited) fitScore += 3;
      if (preferences.fiveG && offer.fiveG) fitScore += 2;
      break;
    
    default:
      // Generic fit based on standard match
      const standard = enrichedProfile.standard || 'medium';
      if (offer.standard === standard) fitScore += 3;
  }
  
  return Math.min(10, fitScore);
}

/**
 * Trust score (0-100)
 * 
 * Bazuje na seller reputation, reviews, etc
 */
function calculateTrustScore(offer) {
  let trust = 50; // Base trust
  
  // 1. Seller reputation
  if (offer.seller) {
    const trustedSellers = [
      'booking.com', 'expedia', 'hotels.com', // Vacation
      'essent', 'eneco', 'vattenfall', 'greenchoice', // Energy
      'kpn', 'vodafone', 't-mobile', 'ziggo', // Telecom
      'ing', 'rabobank', 'abn amro', 'sns' // Finance
    ];
    
    const sellerLower = offer.seller.toLowerCase();
    const isTrusted = trustedSellers.some(s => sellerLower.includes(s));
    
    if (isTrusted) trust += 30;
  }
  
  // 2. Reviews
  const reviewCount = offer.reviewCount || 0;
  const rating = offer.rating || offer.reviewScore || 0;
  
  if (reviewCount >= 100 && rating >= 4.0) trust += 20;
  else if (reviewCount >= 50 && rating >= 3.5) trust += 10;
  else if (reviewCount >= 10 && rating >= 3.0) trust += 5;
  
  // 3. Completeness (has all data)
  if (offer.title && offer.price && offer.description) trust += 10;
  
  return Math.min(100, trust);
}

/**
 * Freshness score (0-10)
 * 
 * Nowe oferty = wyższy score (flash sales, last minute)
 */
function calculateFreshnessScore(offer) {
  if (!offer.createdAt && !offer.updatedAt) return 5.0;
  
  const timestamp = offer.updatedAt || offer.createdAt;
  const age = Date.now() - timestamp;
  
  // < 24h = 10
  // < 7 days = 7
  // < 30 days = 5
  // > 30 days = 3
  
  const hours = age / (1000 * 60 * 60);
  
  if (hours < 24) return 10.0;
  if (hours < 24 * 7) return 7.0;
  if (hours < 24 * 30) return 5.0;
  return 3.0;
}

/**
 * Offer confidence (hoog/medium/laag)
 */
function getOfferConfidence(offer, qualityScore) {
  const hasReviews = (offer.reviewCount || 0) >= 10;
  const hasGoodRating = (offer.rating || 0) >= 3.5;
  const isHighQuality = qualityScore >= 7.0;
  
  if (hasReviews && hasGoodRating && isHighQuality) return 'hoog';
  if (hasReviews || hasGoodRating) return 'medium';
  return 'laag';
}

/**
 * Rotacja (40/30/20/10) - jak w produktach
 */
function rotateServiceOffers(offers, userId = null) {
  if (!offers || offers.length === 0) return [];
  
  // Sort by deal score
  const sorted = offers.slice().sort((a, b) => {
    const scoreA = a._dealScore?.dealScore || 0;
    const scoreB = b._dealScore?.dealScore || 0;
    return scoreB - scoreA;
  });
  
  // Split into tiers
  const total = sorted.length;
  const tier1Size = Math.ceil(total * 0.4); // 40% best
  const tier2Size = Math.ceil(total * 0.3); // 30% alternative
  const tier3Size = Math.ceil(total * 0.2); // 20% niche
  
  const tier1 = sorted.slice(0, tier1Size); // Best deals
  const tier2 = sorted.slice(tier1Size, tier1Size + tier2Size); // Alternatives
  const tier3 = sorted.slice(tier1Size + tier2Size, tier1Size + tier2Size + tier3Size); // Niche
  const tier4 = sorted.slice(tier1Size + tier2Size + tier3Size); // Experiment
  
  // Shuffle within tiers (user-specific seed)
  const seed = userId ? hashCode(userId) : Date.now();
  
  const shuffled = [
    ...shuffle(tier1, seed),
    ...shuffle(tier2, seed + 1),
    ...shuffle(tier3, seed + 2),
    ...shuffle(tier4, seed + 3)
  ];
  
  return shuffled;
}

/**
 * Helper: shuffle array with seed
 */
function shuffle(array, seed) {
  const arr = array.slice();
  let currentIndex = arr.length;
  let randomIndex;
  
  // Seeded random
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  while (currentIndex > 0) {
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  
  return arr;
}

/**
 * Helper: hash string to number
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Final output: TOP 3-5 ofert
 * 
 * Format:
 * - 🥇 Najlepsza opcja (AI pick)
 * - 🥈 Tańsza alternatywa
 * - 💎 Najlepsza jakość/cena
 * - 🔥 Hidden gem
 */
function selectTopOffers(offers, maxOffers = 5) {
  if (!offers || offers.length === 0) return [];
  
  const sorted = offers.slice().sort((a, b) => {
    const scoreA = a._dealScore?.dealScore || 0;
    const scoreB = b._dealScore?.dealScore || 0;
    return scoreB - scoreA;
  });
  
  const top = [];
  
  // 1. 🥇 Najlepsza opcja (highest deal score)
  if (sorted.length > 0) {
    top.push({
      ...sorted[0],
      _label: 'best',
      _icon: '🥇',
      _description: 'Najlepsza opcja (AI pick)'
    });
  }
  
  // 2. 🥈 Tańsza alternatywa (lowest price with good score)
  const cheapest = sorted
    .filter(o => o._dealScore?.dealScore >= 6.0)
    .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))[0];
  
  if (cheapest && cheapest !== sorted[0]) {
    top.push({
      ...cheapest,
      _label: 'cheapest',
      _icon: '🥈',
      _description: 'Tańsza alternatywa'
    });
  }
  
  // 3. 💎 Najlepsza jakość/cena (highest quality score)
  const bestQuality = sorted
    .sort((a, b) => {
      const qA = a._dealScore?.qualityScore || 0;
      const qB = b._dealScore?.qualityScore || 0;
      return qB - qA;
    })[0];
  
  if (bestQuality && !top.includes(bestQuality)) {
    top.push({
      ...bestQuality,
      _label: 'quality',
      _icon: '💎',
      _description: 'Najlepsza jakość/cena'
    });
  }
  
  // 4. 🔥 Hidden gem (niche, high fit score)
  const hiddenGem = sorted
    .filter(o => o._dealScore?.fitScore >= 8.0)
    .filter(o => !top.includes(o))[0];
  
  if (hiddenGem) {
    top.push({
      ...hiddenGem,
      _label: 'hidden',
      _icon: '🔥',
      _description: 'Hidden gem'
    });
  }
  
  // 5. Fill remaining slots
  const remaining = sorted.filter(o => !top.includes(o)).slice(0, maxOffers - top.length);
  top.push(...remaining);
  
  return top.slice(0, maxOffers);
}

module.exports = {
  calculateServiceDealScore,
  rotateServiceOffers,
  selectTopOffers,
  enrichProfile,
  fallbackEnrichment,
  generateServiceQueries,
  generateAlternativeQueries,
  filterCheapButGood,
  filterScamOffers,
  getConfidenceScore,
  getPriceVolatility,
  getCategoryWeights,
  getQualityThreshold,
  getCacheTTL,
  getMaxQueries,
  getResultPoolSize
};
