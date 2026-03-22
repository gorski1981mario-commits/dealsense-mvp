"use strict";

/**
 * CATEGORY-SPECIFIC CONFIGURATION
 * 
 * Każda kategoria usług ma inne priorytety:
 * - Wakacje: quality > price (nie chcesz złego hotelu)
 * - Energia: price > quality (głównie cena)
 * - Kredyt: trust > price (bezpieczeństwo)
 */

/**
 * Quality thresholds per kategoria (0-10)
 */
const QUALITY_THRESHOLDS = {
  vacation: 7.5,      // Wysokie (nie chcesz złego hotelu)
  energy: 6.0,        // Średnie (głównie cena)
  telecom: 6.5,       // Średnie (łatwo zmienić)
  insurance: 8.0,     // Bardzo wysokie (bezpieczeństwo)
  leasing: 7.0,       // Wysokie (długoterminowe)
  loan: 7.5,          // Wysokie (zaufanie)
  mortgage: 8.0,      // Bardzo wysokie (największa decyzja)
  creditcard: 6.5,    // Średnie (łatwo zmienić)
  subscriptions: 6.0  // Niskie (łatwo anulować)
};

/**
 * Deal Score weights per kategoria
 * 
 * Format: { price, quality, fit, trust, freshness }
 * Suma = 1.0
 */
const CATEGORY_WEIGHTS = {
  vacation: {
    price: 0.3,       // Ważna, ale nie najważniejsza
    quality: 0.3,     // Bardzo ważna (hotel, lokalizacja)
    fit: 0.2,         // Ważna (dopasowanie do preferencji)
    trust: 0.1,       // Średnia (booking.com, expedia)
    freshness: 0.1    // Średnia (last minute deals)
  },
  energy: {
    price: 0.6,       // NAJWAŻNIEJSZA (główny powód zmiany)
    quality: 0.2,     // Średnia (stabilność dostaw)
    fit: 0.1,         // Niska (mało opcji)
    trust: 0.1,       // Średnia (regulowane)
    freshness: 0.0    // Nieważna (ceny stabilne)
  },
  telecom: {
    price: 0.4,       // Ważna
    quality: 0.3,     // Ważna (zasięg, prędkość)
    fit: 0.2,         // Ważna (GB, minuty)
    trust: 0.1,       // Średnia (znane marki)
    freshness: 0.0    // Nieważna
  },
  insurance: {
    price: 0.2,       // Średnia (nie najważniejsza)
    quality: 0.3,     // Ważna (zakres ochrony)
    fit: 0.2,         // Ważna (dopasowanie do potrzeb)
    trust: 0.3,       // BARDZO WAŻNA (bezpieczeństwo)
    freshness: 0.0    // Nieważna
  },
  leasing: {
    price: 0.4,       // Ważna (miesięczna rata)
    quality: 0.2,     // Średnia (warunki umowy)
    fit: 0.2,         // Ważna (okres, opcje)
    trust: 0.2,       // Ważna (leasingodawca)
    freshness: 0.0    // Nieważna
  },
  loan: {
    price: 0.5,       // NAJWAŻNIEJSZA (oprocentowanie)
    quality: 0.1,     // Niska (standardowe warunki)
    fit: 0.1,         // Niska (kwota, okres)
    trust: 0.3,       // BARDZO WAŻNA (bank)
    freshness: 0.0    // Nieważna
  },
  mortgage: {
    price: 0.5,       // NAJWAŻNIEJSZA (oprocentowanie)
    quality: 0.2,     // Ważna (warunki, elastyczność)
    fit: 0.1,         // Średnia (okres, kwota)
    trust: 0.2,       // Ważna (bank, stabilność)
    freshness: 0.0    // Nieważna
  },
  creditcard: {
    price: 0.3,       // Ważna (opłaty, oprocentowanie)
    quality: 0.3,     // Ważna (limity, benefity)
    fit: 0.2,         // Ważna (cashback, punkty)
    trust: 0.2,       // Ważna (bank)
    freshness: 0.0    // Nieważna
  },
  subscriptions: {
    price: 0.5,       // NAJWAŻNIEJSZA (miesięczny koszt)
    quality: 0.2,     // Średnia (zawartość)
    fit: 0.2,         // Średnia (preferencje)
    trust: 0.1,       // Niska (łatwo anulować)
    freshness: 0.0    // Nieważna
  }
};

/**
 * Cache TTL per kategoria (w milisekundach)
 * 
 * Wakacje: krótki (ceny zmieniają się często)
 * Kredyty: długi (ceny stabilne)
 */
const CACHE_TTL = {
  vacation: {
    highSeason: 30 * 60 * 1000,   // 30 min (czerwiec-sierpień)
    lowSeason: 6 * 60 * 60 * 1000  // 6h (listopad-marzec)
  },
  energy: 12 * 60 * 60 * 1000,      // 12h (stabilne ceny)
  telecom: 24 * 60 * 60 * 1000,     // 24h (bardzo stabilne)
  insurance: 24 * 60 * 60 * 1000,   // 24h (stabilne)
  leasing: 6 * 60 * 60 * 1000,      // 6h (średnio stabilne)
  loan: 6 * 60 * 60 * 1000,         // 6h (średnio stabilne)
  mortgage: 24 * 60 * 60 * 1000,    // 24h (stabilne)
  creditcard: 24 * 60 * 60 * 1000,  // 24h (stabilne)
  subscriptions: 12 * 60 * 60 * 1000 // 12h (średnio stabilne)
};

/**
 * High season months (dla wakacji)
 */
const HIGH_SEASON_MONTHS = [6, 7, 8]; // Czerwiec, Lipiec, Sierpień

/**
 * Max queries per kategoria (cost control)
 */
const MAX_QUERIES = {
  vacation: 3,        // 3 queries (różne destynacje/daty)
  energy: 1,          // 1 query (proste porównanie)
  telecom: 2,         // 2 queries (różne operatorzy)
  insurance: 2,       // 2 queries (różne typy)
  leasing: 1,         // 1 query (proste porównanie)
  loan: 1,            // 1 query (proste porównanie)
  mortgage: 1,        // 1 query (proste porównanie)
  creditcard: 2,      // 2 queries (różne typy)
  subscriptions: 2    // 2 queries (różne platformy)
};

/**
 * Result pool size per kategoria
 */
const RESULT_POOL_SIZE = {
  vacation: 50,       // Dużo opcji (różne hotele)
  energy: 20,         // Mało opcji (kilka dostawców)
  telecom: 30,        // Średnio opcji
  insurance: 40,      // Dużo opcji (różne pakiety)
  leasing: 20,        // Mało opcji
  loan: 20,           // Mało opcji
  mortgage: 20,       // Mało opcji
  creditcard: 30,     // Średnio opcji
  subscriptions: 40   // Dużo opcji (Netflix, Spotify, etc)
};

/**
 * Pobiera quality threshold dla kategorii
 */
function getQualityThreshold(category) {
  return QUALITY_THRESHOLDS[category] || 7.0; // Default: 7.0
}

/**
 * Pobiera weights dla kategorii
 */
function getCategoryWeights(category) {
  return CATEGORY_WEIGHTS[category] || {
    price: 0.4,
    quality: 0.2,
    fit: 0.2,
    trust: 0.1,
    freshness: 0.1
  };
}

/**
 * Pobiera cache TTL dla kategorii
 */
function getCacheTTL(category, options = {}) {
  const { month } = options;
  
  // Wakacje: dynamic TTL based on season
  if (category === 'vacation' && month) {
    const isHighSeason = HIGH_SEASON_MONTHS.includes(month);
    return isHighSeason 
      ? CACHE_TTL.vacation.highSeason 
      : CACHE_TTL.vacation.lowSeason;
  }
  
  return CACHE_TTL[category] || 6 * 60 * 60 * 1000; // Default: 6h
}

/**
 * Pobiera max queries dla kategorii
 */
function getMaxQueries(category) {
  return MAX_QUERIES[category] || 2; // Default: 2
}

/**
 * Pobiera result pool size dla kategorii
 */
function getResultPoolSize(category) {
  return RESULT_POOL_SIZE[category] || 30; // Default: 30
}

/**
 * Sprawdza czy kategoria wymaga high quality
 */
function requiresHighQuality(category) {
  const threshold = getQualityThreshold(category);
  return threshold >= 7.5; // Insurance, Mortgage, Vacation
}

/**
 * Sprawdza czy kategoria jest price-sensitive
 */
function isPriceSensitive(category) {
  const weights = getCategoryWeights(category);
  return weights.price >= 0.5; // Energy, Loan, Mortgage, Subscriptions
}

module.exports = {
  QUALITY_THRESHOLDS,
  CATEGORY_WEIGHTS,
  CACHE_TTL,
  MAX_QUERIES,
  RESULT_POOL_SIZE,
  getQualityThreshold,
  getCategoryWeights,
  getCacheTTL,
  getMaxQueries,
  getResultPoolSize,
  requiresHighQuality,
  isPriceSensitive
};
