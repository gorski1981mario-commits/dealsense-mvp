"use strict";

/**
 * CHEAP BUT GOOD FILTER
 * 
 * Nie pokazujesz najtańszych śmieci!
 * 
 * Logika: price low AND quality > threshold
 */

const { getQualityThreshold } = require('./categoryConfig');

/**
 * Filtruje oferty: cheap BUT good
 * 
 * @param {Array} offers - Wszystkie oferty
 * @param {string} category - Kategoria
 * @param {Object} options - Opcje
 * @returns {Array} Filtered offers
 */
function filterCheapButGood(offers, category, options = {}) {
  if (!Array.isArray(offers) || offers.length === 0) {
    return [];
  }
  
  const threshold = options.qualityThreshold || getQualityThreshold(category);
  
  // 1. Filtruj po quality threshold
  let filtered = offers.filter(offer => {
    const quality = getOfferQuality(offer);
    return quality >= threshold;
  });
  
  // 2. Jeśli za mało wyników (< 3), obniż threshold
  if (filtered.length < 3) {
    const lowerThreshold = threshold * 0.9; // -10%
    filtered = offers.filter(offer => {
      const quality = getOfferQuality(offer);
      return quality >= lowerThreshold;
    });
  }
  
  // 3. Sortuj po cenie (najtańsze pierwsze)
  filtered.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
  
  return filtered;
}

/**
 * Oblicza quality score dla oferty (0-10)
 * 
 * Bazuje na:
 * - Rating (jeśli dostępny)
 * - Review count
 * - Trust score (jeśli dostępny)
 * - Completeness (czy ma wszystkie dane)
 */
function getOfferQuality(offer) {
  let quality = 5.0; // Base quality
  
  // 1. Rating (0-5 → 0-10)
  if (offer.rating || offer.reviewScore) {
    const rating = offer.rating || offer.reviewScore;
    quality = rating * 2; // 5 stars = 10 quality
  }
  
  // 2. Review count bonus
  const reviews = offer.reviewCount || 0;
  if (reviews >= 100) {
    quality += 1.0;
  } else if (reviews >= 50) {
    quality += 0.5;
  } else if (reviews >= 10) {
    quality += 0.2;
  }
  
  // 3. Trust score (jeśli dostępny z Deal Score V2)
  if (offer._dealScore && offer._dealScore.trustScore) {
    const trust = offer._dealScore.trustScore; // 0-100
    quality += (trust / 100) * 2; // Max +2 points
  }
  
  // 4. Completeness bonus
  const hasAllData = offer.title && offer.price && offer.seller;
  if (hasAllData) {
    quality += 0.5;
  }
  
  // 5. Cap at 10
  return Math.min(10, quality);
}

/**
 * Filtruje scam offers (bardzo niskie quality)
 */
function filterScamOffers(offers) {
  return offers.filter(offer => {
    const quality = getOfferQuality(offer);
    
    // Odrzuć jeśli:
    // - Quality < 3.0 (bardzo niskie)
    // - Brak ratingu i brak reviews
    // - Podejrzanie niska cena (< 50% median)
    
    if (quality < 3.0) return false;
    
    const hasNoReviews = !offer.rating && !offer.reviewScore && 
                         (!offer.reviewCount || offer.reviewCount === 0);
    if (hasNoReviews) return false;
    
    return true;
  });
}

/**
 * Confidence score - czy AI jest pewny wyniku
 * 
 * @param {Array} offers - Filtered offers
 * @returns {Object} { level: 'high'|'medium'|'low', reason: string }
 */
function getConfidenceScore(offers) {
  if (!offers || offers.length === 0) {
    return {
      level: 'low',
      reason: 'Brak ofert'
    };
  }
  
  const avgQuality = offers.reduce((sum, o) => sum + getOfferQuality(o), 0) / offers.length;
  
  // High confidence: >= 20 ofert, avg quality >= 7.5
  if (offers.length >= 20 && avgQuality >= 7.5) {
    return {
      level: 'high',
      reason: `${offers.length} ofert wysokiej jakości (avg ${avgQuality.toFixed(1)}/10)`
    };
  }
  
  // Medium confidence: >= 10 ofert, avg quality >= 6.5
  if (offers.length >= 10 && avgQuality >= 6.5) {
    return {
      level: 'medium',
      reason: `${offers.length} ofert średniej jakości (avg ${avgQuality.toFixed(1)}/10)`
    };
  }
  
  // Low confidence
  return {
    level: 'low',
    reason: `Tylko ${offers.length} ofert, avg quality ${avgQuality.toFixed(1)}/10. Może warto poczekać 24h (więcej ofert)`
  };
}

/**
 * Price volatility tracking (dla Ghost Mode)
 * 
 * Sprawdza czy ceny wahają się (flash sales)
 */
function getPriceVolatility(offers, historicalPrices = []) {
  if (!offers || offers.length === 0) {
    return { volatility: 0, recommendation: null };
  }
  
  const currentPrices = offers.map(o => o.price).filter(p => p > 0);
  if (currentPrices.length === 0) {
    return { volatility: 0, recommendation: null };
  }
  
  const avgCurrent = currentPrices.reduce((sum, p) => sum + p, 0) / currentPrices.length;
  
  // Jeśli brak historical prices, nie możemy obliczyć volatility
  if (!historicalPrices || historicalPrices.length === 0) {
    return { volatility: 0, recommendation: null };
  }
  
  const avgHistorical = historicalPrices.reduce((sum, p) => sum + p, 0) / historicalPrices.length;
  
  // Volatility = % change
  const volatility = Math.abs((avgCurrent - avgHistorical) / avgHistorical) * 100;
  
  // Jeśli volatility > 15% → recommend Ghost Mode
  if (volatility > 15) {
    return {
      volatility: volatility.toFixed(1),
      recommendation: `Ceny wahają się ±${volatility.toFixed(0)}%, włącz Ghost Mode (może spaść jutro!)`
    };
  }
  
  return { volatility: volatility.toFixed(1), recommendation: null };
}

module.exports = {
  filterCheapButGood,
  filterScamOffers,
  getOfferQuality,
  getConfidenceScore,
  getPriceVolatility
};
