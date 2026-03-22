"use strict";

/**
 * QUERY SCORING SYSTEM
 * 
 * Zamiast 30-50 zapytań → tylko 5-10 najlepszych!
 * Oszczędność: -70% zapytań
 * 
 * Scoring: history_performance + CTR + deal_rate + uniqueness
 */

/**
 * Query performance history (w pamięci, można przenieść do Redis)
 * 
 * Format: { query: { searches: X, offers: Y, avgDealScore: Z, ctr: W } }
 */
const queryHistory = new Map();

/**
 * Oblicza score dla query based on history
 * 
 * Scoring formula:
 * score = (history_performance * 0.4) + (CTR * 0.3) + (deal_rate * 0.2) + (uniqueness * 0.1)
 */
function getQueryScore(query, productName) {
  const history = queryHistory.get(query);
  
  // Nowe query (brak historii) = średni score
  if (!history) {
    return 50; // Neutral score (exploration)
  }
  
  let score = 0;
  
  // 1. History Performance (40%) - ile ofert zwraca, jaki avg deal score
  const avgOffers = history.offers / history.searches;
  const performanceScore = Math.min(100, (avgOffers / 50) * 100); // 50 ofert = 100%
  const dealQuality = (history.avgDealScore / 10) * 100; // Deal score 0-10 → 0-100%
  const historyScore = (performanceScore * 0.5) + (dealQuality * 0.5);
  score += historyScore * 0.4;
  
  // 2. CTR (30%) - Click-Through Rate (ile razy user kliknął w oferty z tego query)
  const ctr = history.ctr || 0;
  score += ctr * 0.3;
  
  // 3. Deal Rate (20%) - % ofert które były "good deals" (score >= 7)
  const dealRate = history.dealRate || 50; // Default 50%
  score += dealRate * 0.2;
  
  // 4. Uniqueness (10%) - czy query daje unikalne wyniki vs inne queries
  const uniqueness = history.uniqueness || 50; // Default 50%
  score += uniqueness * 0.1;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Aktualizuje historię query po wykonaniu searcha
 */
function updateQueryHistory(query, results) {
  const history = queryHistory.get(query) || {
    searches: 0,
    offers: 0,
    avgDealScore: 0,
    ctr: 0,
    dealRate: 0,
    uniqueness: 50,
    lastUsed: Date.now()
  };
  
  history.searches++;
  history.offers += results.offerCount || 0;
  history.lastUsed = Date.now();
  
  // Update avg deal score (running average)
  if (results.avgDealScore) {
    history.avgDealScore = ((history.avgDealScore * (history.searches - 1)) + results.avgDealScore) / history.searches;
  }
  
  // Update deal rate
  if (results.dealRate !== undefined) {
    history.dealRate = ((history.dealRate * (history.searches - 1)) + results.dealRate) / history.searches;
  }
  
  queryHistory.set(query, history);
}

/**
 * Aktualizuje CTR dla query (gdy user kliknie w ofertę)
 */
function updateQueryCTR(query, clicked = true) {
  const history = queryHistory.get(query);
  if (!history) return;
  
  const totalClicks = (history.ctr / 100) * history.searches;
  const newClicks = clicked ? totalClicks + 1 : totalClicks;
  history.ctr = (newClicks / history.searches) * 100;
  
  queryHistory.set(query, history);
}

/**
 * Wybiera najlepsze N queries z listy
 * 
 * @param {string[]} queries - Lista wszystkich możliwych queries
 * @param {string} productName - Nazwa produktu
 * @param {number} maxQueries - Max liczba queries do wybrania (5-10)
 * @returns {Object[]} Sorted queries with scores
 */
function selectBestQueries(queries, productName, maxQueries = 10) {
  if (!Array.isArray(queries) || queries.length === 0) {
    return [];
  }
  
  // Oblicz score dla każdego query
  const scored = queries.map(query => ({
    query,
    score: getQueryScore(query, productName),
    hasHistory: queryHistory.has(query)
  }));
  
  // Sortuj po score (malejąco)
  scored.sort((a, b) => b.score - a.score);
  
  // Wybierz top N
  const topQueries = scored.slice(0, maxQueries);
  
  // Jeśli wszystkie mają historię, dodaj 1-2 nowe dla exploration (10% chance)
  const allHaveHistory = topQueries.every(q => q.hasHistory);
  if (allHaveHistory && Math.random() < 0.1) {
    const newQueries = scored.filter(q => !q.hasHistory);
    if (newQueries.length > 0) {
      // Zamień ostatnie query na nowe (exploration)
      topQueries[topQueries.length - 1] = newQueries[0];
    }
  }
  
  return topQueries;
}

/**
 * Cold start strategy - dla nowych produktów bez historii
 * 
 * Używa więcej queries (15-20) zamiast 5-10
 * Po 10-20 searches → włącz scoring
 */
function shouldUseColdStart(productName) {
  // Sprawdź ile queries dla tego produktu ma historię
  const productQueries = Array.from(queryHistory.keys())
    .filter(q => q.toLowerCase().includes(productName.toLowerCase()));
  
  // Jeśli < 5 queries ma historię → cold start
  return productQueries.length < 5;
}

/**
 * Query statistics (dla monitoringu)
 */
function getQueryStats() {
  const stats = {
    totalQueries: queryHistory.size,
    totalSearches: 0,
    totalOffers: 0,
    avgScore: 0,
    topQueries: []
  };
  
  const allQueries = Array.from(queryHistory.entries());
  
  allQueries.forEach(([query, history]) => {
    stats.totalSearches += history.searches;
    stats.totalOffers += history.offers;
  });
  
  // Top 10 queries by performance
  const sorted = allQueries
    .map(([query, history]) => ({
      query,
      searches: history.searches,
      avgOffers: (history.offers / history.searches).toFixed(1),
      avgDealScore: history.avgDealScore.toFixed(2),
      ctr: history.ctr.toFixed(1) + '%'
    }))
    .sort((a, b) => b.searches - a.searches)
    .slice(0, 10);
  
  stats.topQueries = sorted;
  stats.avgOffersPerSearch = stats.totalSearches > 0 
    ? (stats.totalOffers / stats.totalSearches).toFixed(1) 
    : 0;
  
  return stats;
}

/**
 * Czyści stare queries (> 30 dni nieużywane)
 */
function cleanOldQueries() {
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dni
  
  let cleaned = 0;
  for (const [query, history] of queryHistory.entries()) {
    if (now - history.lastUsed > maxAge) {
      queryHistory.delete(query);
      cleaned++;
    }
  }
  
  return cleaned;
}

module.exports = {
  getQueryScore,
  updateQueryHistory,
  updateQueryCTR,
  selectBestQueries,
  shouldUseColdStart,
  getQueryStats,
  cleanOldQueries
};
