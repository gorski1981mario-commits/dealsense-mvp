"use strict";

/**
 * CACHE FIRST STRATEGY + MULTI-USER SHARING
 * 
 * NAJWIĘKSZA OSZCZĘDNOŚĆ: -90% kosztów API!
 * 
 * Strategia:
 * - 1 zapytanie → 100 userów (multi-user sharing)
 * - Popularne produkty: cache 5-15 min
 * - Średnie: 30-60 min
 * - Niszowe: 6-24h
 * - Adaptive TTL based on price volatility
 */

const crypto = require('crypto');

/**
 * Generuje cache key dla produktu
 * 
 * Cache key = product + location + preferences
 * Dzięki temu różni userzy z tymi samymi preferencjami dzielą cache
 */
function generateCacheKey(productName, ean, options = {}) {
  const parts = [];
  
  // Product identifier (EAN preferred, fallback to name)
  if (ean) {
    parts.push(`ean:${ean}`);
  } else if (productName) {
    // Normalize product name (lowercase, remove special chars)
    const normalized = String(productName)
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    parts.push(`product:${normalized}`);
  }
  
  // Location (optional)
  if (options.userLocation) {
    const location = String(options.userLocation).toLowerCase();
    parts.push(`loc:${location}`);
  }
  
  // Preferences (optional)
  if (options.filterType) {
    parts.push(`filter:${options.filterType}`);
  }
  
  if (options.maxDeliveryDays) {
    parts.push(`delivery:${options.maxDeliveryDays}`);
  }
  
  // Generate hash for long keys
  const key = parts.join('|');
  if (key.length > 100) {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return `cache:${hash}`;
  }
  
  return `cache:${key}`;
}

/**
 * Oblicza product popularity score (0-100)
 * 
 * Im wyższy score, tym bardziej popularny produkt
 * Popularne produkty = krótszy cache (częste zmiany cen)
 */
function getProductPopularity(productName, ean) {
  // Lista popularnych produktów (można rozszerzyć)
  const popularProducts = [
    'iphone', 'samsung', 'playstation', 'xbox', 'macbook',
    'airpods', 'ipad', 'nintendo', 'gopro', 'dyson',
    'sony', 'lg', 'philips', 'bosch', 'apple watch'
  ];
  
  const name = String(productName || '').toLowerCase();
  
  // Check if product name contains popular keywords
  let score = 0;
  for (const keyword of popularProducts) {
    if (name.includes(keyword)) {
      score = 80; // High popularity
      break;
    }
  }
  
  // EAN products are typically more popular (retail)
  if (ean && score === 0) {
    score = 50; // Medium popularity
  }
  
  // Default: low popularity (niche)
  if (score === 0) {
    score = 20;
  }
  
  return score;
}

/**
 * Oblicza price volatility score (0-100)
 * 
 * Im wyższy score, tym więcej zmian cen
 * Wysoka volatility = krótszy cache
 * 
 * TODO: Można to ulepszyć śledząc rzeczywistą historię cen
 */
function getPriceVolatility(productName, ean, priceHistory = []) {
  // Jeśli mamy historię cen, oblicz rzeczywistą volatility
  if (Array.isArray(priceHistory) && priceHistory.length >= 2) {
    const prices = priceHistory.map(p => p.price).filter(p => p > 0);
    if (prices.length >= 2) {
      const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);
      const cv = (stdDev / avg) * 100; // Coefficient of variation
      
      // CV > 10% = high volatility
      if (cv > 10) return 80;
      if (cv > 5) return 50;
      return 20;
    }
  }
  
  // Fallback: heurystyka based on product type
  const name = String(productName || '').toLowerCase();
  
  // Elektronika = medium-high volatility (częste promocje)
  if (name.includes('iphone') || name.includes('samsung') || name.includes('laptop')) {
    return 60;
  }
  
  // Gaming = high volatility (flash sales)
  if (name.includes('playstation') || name.includes('xbox') || name.includes('nintendo')) {
    return 70;
  }
  
  // Default: low volatility
  return 30;
}

/**
 * Oblicza adaptive cache TTL (w milisekundach)
 * 
 * Strategia:
 * - Popularne + wysoka volatility = krótki cache (5 min)
 * - Popularne + niska volatility = średni cache (15 min)
 * - Niszowe + wysoka volatility = średni cache (30 min)
 * - Niszowe + niska volatility = długi cache (6-24h)
 */
function getAdaptiveCacheTTL(productName, ean, options = {}) {
  const popularity = getProductPopularity(productName, ean);
  const volatility = getPriceVolatility(productName, ean, options.priceHistory);
  
  // Popularne produkty (score >= 70)
  if (popularity >= 70) {
    if (volatility >= 70) {
      return 5 * 60 * 1000; // 5 min (flash sales)
    } else if (volatility >= 50) {
      return 10 * 60 * 1000; // 10 min
    } else {
      return 15 * 60 * 1000; // 15 min
    }
  }
  
  // Średnio popularne (score 40-69)
  if (popularity >= 40) {
    if (volatility >= 70) {
      return 30 * 60 * 1000; // 30 min
    } else if (volatility >= 50) {
      return 45 * 60 * 1000; // 45 min
    } else {
      return 60 * 60 * 1000; // 1h
    }
  }
  
  // Niszowe (score < 40)
  if (volatility >= 70) {
    return 2 * 60 * 60 * 1000; // 2h
  } else if (volatility >= 50) {
    return 6 * 60 * 60 * 1000; // 6h
  } else {
    return 24 * 60 * 60 * 1000; // 24h (bardzo stabilne niszowe)
  }
}

/**
 * Sprawdza czy cache entry jest świeży
 */
function isCacheFresh(cacheEntry, ttl) {
  if (!cacheEntry || !cacheEntry.timestamp) return false;
  
  const age = Date.now() - cacheEntry.timestamp;
  return age < ttl;
}

/**
 * Tworzy cache entry
 */
function createCacheEntry(offers, metadata = {}) {
  return {
    timestamp: Date.now(),
    offers: offers,
    metadata: {
      productName: metadata.productName || null,
      ean: metadata.ean || null,
      popularity: metadata.popularity || 0,
      volatility: metadata.volatility || 0,
      ttl: metadata.ttl || 0,
      source: metadata.source || 'unknown',
      offerCount: offers.length
    }
  };
}

/**
 * Cache statistics (dla monitoringu)
 */
const cacheStats = {
  hits: 0,
  misses: 0,
  multiUserSharing: 0, // Ile razy cache był użyty przez wielu userów
  totalSavings: 0 // Szacunkowa oszczędność w $
};

function getCacheStats() {
  const hitRate = cacheStats.hits + cacheStats.misses > 0
    ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(1)
    : 0;
  
  return {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    estimatedMonthlySavings: `$${(cacheStats.totalSavings * 30).toFixed(2)}`
  };
}

function incrementCacheHit(savedCost = 0.005) {
  cacheStats.hits++;
  cacheStats.totalSavings += savedCost;
}

function incrementCacheMiss() {
  cacheStats.misses++;
}

function incrementMultiUserSharing() {
  cacheStats.multiUserSharing++;
}

function resetCacheStats() {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.multiUserSharing = 0;
  cacheStats.totalSavings = 0;
}

module.exports = {
  generateCacheKey,
  getProductPopularity,
  getPriceVolatility,
  getAdaptiveCacheTTL,
  isCacheFresh,
  createCacheEntry,
  getCacheStats,
  incrementCacheHit,
  incrementCacheMiss,
  incrementMultiUserSharing,
  resetCacheStats
};
