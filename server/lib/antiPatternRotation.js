"use strict";

/**
 * ANTI-PATTERN LEARNING ROTATION
 * 
 * UNFAIR ADVANTAGE - KONKURENCJA TEGO NIE MA!
 * 
 * User skanuje iPhone 10 razy → dostaje 10 RÓŻNYCH zestawów sklepów
 * Każdy zestaw = OPTYMALNY (top deals)
 * User NIE MOŻE się nauczyć patternu
 * User MUSI wracać do nas za każdym razem
 * 
 * STRATEGIA:
 * - userId + productName + scanCount = SEED
 * - Deterministyczny shuffle based on seed
 * - Filtruj sklepy z ostatnich 10 skanów
 * - Zwróć top N (optymalne, ale RÓŻNE)
 */

const crypto = require('crypto');

/**
 * In-memory storage dla shop history
 * Format: userId_productName → [shop1, shop2, shop3, ...]
 */
const userShopHistory = new Map();

/**
 * Seeded Random Generator (deterministyczny)
 */
function seedRandom(seed) {
  let value = seed;
  
  return function() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Hash string to number (seed)
 */
function hashToSeed(str) {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return parseInt(hash.substring(0, 8), 16);
}

/**
 * Deterministyczny shuffle (Fisher-Yates z seeded random)
 */
function deterministicShuffle(array, seed) {
  if (!Array.isArray(array) || array.length === 0) return [];
  
  const random = seedRandom(seed);
  const shuffled = array.slice();
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Pobierz ostatnie sklepy które user widział
 */
function getUserRecentShops(userId, productName, lastNScans = 10) {
  const key = `${userId}_${productName}`;
  const history = userShopHistory.get(key) || [];
  
  // Ostatnie N skanów × 3 sklepy na scan = 30 sklepów
  const recentShops = history.slice(-(lastNScans * 3));
  
  return recentShops;
}

/**
 * Zapisz sklepy które user zobaczył w tym scanie
 */
function trackUserShops(userId, productName, shops) {
  const key = `${userId}_${productName}`;
  const history = userShopHistory.get(key) || [];
  
  // Dodaj nowe sklepy
  history.push(...shops);
  
  // Ogranicz do ostatnich 100 (33 skany × 3 sklepy)
  if (history.length > 100) {
    history.splice(0, history.length - 100);
  }
  
  userShopHistory.set(key, history);
}

/**
 * Wyczyść historię dla usera (opcjonalne)
 */
function clearUserHistory(userId, productName = null) {
  if (productName) {
    const key = `${userId}_${productName}`;
    userShopHistory.delete(key);
  } else {
    // Wyczyść wszystkie produkty dla tego usera
    const keysToDelete = [];
    for (const key of userShopHistory.keys()) {
      if (key.startsWith(`${userId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => userShopHistory.delete(key));
  }
}

/**
 * ANTI-PATTERN ROTATION - Główna funkcja
 * 
 * @param {Array} offers - Oferty z _dealScore (posortowane po dealScore)
 * @param {Object} options - Opcje rotacji
 * @returns {Array} Zrotowane oferty (różne od poprzednich skanów)
 */
function rotateDealsAntiPattern(offers, options = {}) {
  const {
    userId = 'anonymous',
    productName = '',
    scanCount = 0,
    maxResults = 3,
    avoidLastNScans = 10  // Unikaj sklepów z ostatnich N skanów
  } = options;
  
  if (!Array.isArray(offers) || offers.length === 0) return [];
  
  // 1. Generuj seed based on userId + productName + scanCount
  const seedString = `${userId}_${productName}_${scanCount}`;
  const seed = hashToSeed(seedString);
  
  // 2. Deterministyczny shuffle
  const shuffled = deterministicShuffle(offers, seed);
  
  // 3. Pobierz ostatnie sklepy które user widział
  const recentShops = getUserRecentShops(userId, productName, avoidLastNScans);
  
  // 4. Filtruj oferty - unikaj sklepów z ostatnich N skanów
  const filtered = shuffled.filter(offer => {
    const seller = offer.seller || '';
    return !recentShops.includes(seller);
  });
  
  // 5. Jeśli za mało ofert (wszystkie już widziane) → użyj shuffled (reset)
  const available = filtered.length >= maxResults ? filtered : shuffled;
  
  // 6. Zwróć top N
  const result = available.slice(0, maxResults);
  
  // 7. Zapisz które sklepy user zobaczył w tym scanie
  const shopsShown = result.map(o => o.seller || '').filter(s => s);
  trackUserShops(userId, productName, shopsShown);
  
  // 8. Dodaj metadata
  return result.map(offer => ({
    ...offer,
    _rotation: {
      scanCount,
      seed,
      wasFiltered: filtered.length >= maxResults,
      recentShopsCount: recentShops.length
    }
  }));
}

/**
 * Pobierz statystyki rotacji dla usera
 */
function getUserRotationStats(userId, productName) {
  const key = `${userId}_${productName}`;
  const history = userShopHistory.get(key) || [];
  
  // Policz unikalne sklepy
  const uniqueShops = new Set(history);
  
  // Policz ile skanów (zakładając 3 sklepy na scan)
  const scansCount = Math.floor(history.length / 3);
  
  return {
    totalScans: scansCount,
    totalShopsShown: history.length,
    uniqueShops: uniqueShops.size,
    diversity: uniqueShops.size > 0 ? (uniqueShops.size / history.length * 100).toFixed(1) : 0,
    recentShops: history.slice(-30) // Ostatnie 10 skanów
  };
}

module.exports = {
  rotateDealsAntiPattern,
  getUserRecentShops,
  trackUserShops,
  clearUserHistory,
  getUserRotationStats,
  deterministicShuffle,
  hashToSeed
};
