"use strict";

/**
 * ADAPTIVE FETCH - Inteligentne dopytywanie
 * 
 * Nie zawsze robisz full scan!
 * 
 * Logika:
 * - Jeśli masz już 50 ofert z wysokim score → STOP
 * - Jeśli score niski → fetch więcej
 * - System sam decyduje
 */

/**
 * Sprawdza czy warto fetchować więcej ofert
 * 
 * @param {Array} currentOffers - Obecne oferty z _dealScore
 * @param {Object} options - Opcje
 * @returns {Object} { shouldFetch, reason, targetOffers }
 */
function shouldFetchMore(currentOffers, options = {}) {
  const minOffers = options.minOffers || 10;
  const targetOffers = options.targetOffers || 50;
  const minAvgScore = options.minAvgScore || 7.0;
  
  // Brak ofert → FETCH
  if (!currentOffers || currentOffers.length === 0) {
    return {
      shouldFetch: true,
      reason: 'No offers yet',
      targetOffers: targetOffers
    };
  }
  
  // Za mało ofert (< minOffers) → FETCH
  if (currentOffers.length < minOffers) {
    return {
      shouldFetch: true,
      reason: `Too few offers (${currentOffers.length}/${minOffers})`,
      targetOffers: targetOffers - currentOffers.length
    };
  }
  
  // Mamy >= targetOffers → sprawdź jakość
  if (currentOffers.length >= targetOffers) {
    const scores = currentOffers
      .map(o => o._dealScore?.dealScore || 0)
      .filter(s => s > 0);
    
    if (scores.length === 0) {
      // Brak scores → fetch więcej (może być lepiej)
      return {
        shouldFetch: true,
        reason: 'No deal scores available',
        targetOffers: 20
      };
    }
    
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    
    // Wysoki avg score → STOP
    if (avgScore >= minAvgScore) {
      return {
        shouldFetch: false,
        reason: `Good quality (avg score: ${avgScore.toFixed(2)}, target: ${minAvgScore})`,
        targetOffers: 0
      };
    }
    
    // Niski avg score → fetch trochę więcej (safety check)
    return {
      shouldFetch: true,
      reason: `Low quality (avg score: ${avgScore.toFixed(2)}, target: ${minAvgScore})`,
      targetOffers: 10 // Tylko 10 dodatkowych (safety check)
    };
  }
  
  // Mamy między minOffers a targetOffers → sprawdź jakość
  const scores = currentOffers
    .map(o => o._dealScore?.dealScore || 0)
    .filter(s => s > 0);
  
  if (scores.length > 0) {
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    
    // Jeśli już mamy dobry avg score → możemy stop wcześniej
    if (avgScore >= minAvgScore + 1.0) { // +1.0 bonus dla early stop
      return {
        shouldFetch: false,
        reason: `Early stop - excellent quality (avg score: ${avgScore.toFixed(2)})`,
        targetOffers: 0
      };
    }
  }
  
  // Default: fetch więcej
  return {
    shouldFetch: true,
    reason: `Building offer set (${currentOffers.length}/${targetOffers})`,
    targetOffers: targetOffers - currentOffers.length
  };
}

/**
 * Oblicza adaptive price threshold (zamiast stałych 5%)
 * 
 * Strategia:
 * - €0-50: min €2 oszczędności
 * - €50-200: min €5 oszczędności
 * - €200-1000: min €20 oszczędności
 * - €1000+: min €50 oszczędności
 */
function getAdaptivePriceThreshold(basePrice) {
  if (!basePrice || basePrice <= 0) {
    return { minSavings: 2, minPercent: 5 };
  }
  
  if (basePrice <= 50) {
    return {
      minSavings: 2,
      minPercent: (2 / basePrice) * 100
    };
  }
  
  if (basePrice <= 200) {
    return {
      minSavings: 5,
      minPercent: (5 / basePrice) * 100
    };
  }
  
  if (basePrice <= 1000) {
    return {
      minSavings: 20,
      minPercent: (20 / basePrice) * 100
    };
  }
  
  // €1000+
  return {
    minSavings: 50,
    minPercent: (50 / basePrice) * 100
  };
}

/**
 * Filtruje oferty based on adaptive threshold
 */
function filterByAdaptiveThreshold(offers, basePrice) {
  if (!Array.isArray(offers) || offers.length === 0) {
    return offers;
  }
  
  if (!basePrice || basePrice <= 0) {
    return offers;
  }
  
  const threshold = getAdaptivePriceThreshold(basePrice);
  
  return offers.filter(offer => {
    const price = offer.price || 0;
    if (price <= 0 || price >= basePrice) {
      return false;
    }
    
    const savings = basePrice - price;
    const savingsPercent = (savings / basePrice) * 100;
    
    // Musi spełniać ALBO min savings ALBO min percent
    return savings >= threshold.minSavings || savingsPercent >= threshold.minPercent;
  });
}

/**
 * Adaptive fetch statistics
 */
const fetchStats = {
  totalFetches: 0,
  earlyStops: 0,
  fullFetches: 0,
  avgOffersPerFetch: 0,
  totalOffersFetched: 0
};

function trackFetch(offerCount, stopped = false) {
  fetchStats.totalFetches++;
  fetchStats.totalOffersFetched += offerCount;
  
  if (stopped) {
    fetchStats.earlyStops++;
  } else {
    fetchStats.fullFetches++;
  }
  
  fetchStats.avgOffersPerFetch = fetchStats.totalOffersFetched / fetchStats.totalFetches;
}

function getFetchStats() {
  const earlyStopRate = fetchStats.totalFetches > 0
    ? (fetchStats.earlyStops / fetchStats.totalFetches * 100).toFixed(1)
    : 0;
  
  return {
    ...fetchStats,
    earlyStopRate: `${earlyStopRate}%`,
    avgOffersPerFetch: fetchStats.avgOffersPerFetch.toFixed(1)
  };
}

function resetFetchStats() {
  fetchStats.totalFetches = 0;
  fetchStats.earlyStops = 0;
  fetchStats.fullFetches = 0;
  fetchStats.avgOffersPerFetch = 0;
  fetchStats.totalOffersFetched = 0;
}

module.exports = {
  shouldFetchMore,
  getAdaptivePriceThreshold,
  filterByAdaptiveThreshold,
  trackFetch,
  getFetchStats,
  resetFetchStats
};
