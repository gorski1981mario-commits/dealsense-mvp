"use strict";

/**
 * SOURCE PRIORITY SYSTEM
 * 
 * Nie każde źródło jest równe!
 * 
 * Kolejność (koszt vs wartość):
 * 1. Cache (koszt: 0, wartość: 🔥🔥🔥)
 * 2. Własne sklepy (koszt: niski, wartość: 🔥🔥🔥)
 * 3. Tanie API (koszt: średni, wartość: 🔥🔥)
 * 4. Drogie API (koszt: wysoki, wartość: 🔥)
 */

const SOURCE_PRIORITY = {
  CACHE: {
    priority: 1,
    cost: 0,
    value: 100,
    name: 'cache',
    description: 'Memory/Redis cache (FREE!)'
  },
  OWN_SHOPS: {
    priority: 2,
    cost: 0.001,
    value: 95,
    name: 'own_shops',
    description: 'Własna baza sklepów (bardzo tanie)'
  },
  SEARCHAPI: {
    priority: 3,
    cost: 0.005,
    value: 85,
    name: 'searchapi',
    description: 'SearchAPI.io (tanie, dobre)'
  },
  SERPAPI: {
    priority: 4,
    cost: 0.015,
    value: 80,
    name: 'serpapi',
    description: 'SerpAPI (droższe, fallback)'
  },
  CRAWLER: {
    priority: 5,
    cost: 0.05,
    value: 90,
    name: 'crawler',
    description: 'Własny crawler (drogie, ale najlepsze dla niche)'
  },
  MOCK: {
    priority: 99,
    cost: 0,
    value: 10,
    name: 'mock',
    description: 'Mock data (tylko dla testów)'
  }
};

/**
 * Decyduje którą strategię użyć based on product type
 * 
 * Popularne produkty: cache first (oszczędność)
 * Niszowe produkty: skip cache, idź do crawler (jakość)
 */
function getSourceStrategy(productName, ean, options = {}) {
  const { getProductPopularity } = require('./cacheStrategy');
  
  const popularity = getProductPopularity(productName, ean);
  
  // Popularne (>= 70): cache first
  if (popularity >= 70) {
    return {
      strategy: 'cache_first',
      sources: [
        SOURCE_PRIORITY.CACHE,
        SOURCE_PRIORITY.OWN_SHOPS,
        SOURCE_PRIORITY.SEARCHAPI,
        SOURCE_PRIORITY.SERPAPI
      ],
      maxSources: 2, // Próbuj max 2 źródła (oszczędność)
      description: 'Popular product - cache first strategy'
    };
  }
  
  // Średnio popularne (40-69): balanced
  if (popularity >= 40) {
    return {
      strategy: 'balanced',
      sources: [
        SOURCE_PRIORITY.CACHE,
        SOURCE_PRIORITY.SEARCHAPI,
        SOURCE_PRIORITY.OWN_SHOPS,
        SOURCE_PRIORITY.CRAWLER
      ],
      maxSources: 3,
      description: 'Medium popularity - balanced strategy'
    };
  }
  
  // Niszowe (< 40): quality first
  return {
    strategy: 'quality_first',
    sources: [
      SOURCE_PRIORITY.CRAWLER, // Crawler first dla niszowych!
      SOURCE_PRIORITY.SEARCHAPI,
      SOURCE_PRIORITY.OWN_SHOPS,
      SOURCE_PRIORITY.CACHE
    ],
    maxSources: 4, // Więcej źródeł dla niszowych (jakość > koszt)
    description: 'Niche product - quality first strategy (crawler priority)'
  };
}

/**
 * Oblicza szacunkowy koszt dla źródła
 */
function getSourceCost(sourceName, offerCount = 100) {
  const source = Object.values(SOURCE_PRIORITY).find(s => s.name === sourceName);
  if (!source) return 0;
  
  // Cache i mock = FREE
  if (source.cost === 0) return 0;
  
  // Inne źródła: koszt per request
  return source.cost;
}

/**
 * Sortuje źródła według priorytetu
 */
function sortSourcesByPriority(sources) {
  return sources.slice().sort((a, b) => a.priority - b.priority);
}

/**
 * Sprawdza czy warto próbować kolejne źródło
 * 
 * Logika:
 * - Jeśli masz już 50+ ofert z wysokim score → STOP
 * - Jeśli score niski → próbuj dalej
 */
function shouldTryNextSource(currentOffers, currentSource, nextSource, options = {}) {
  // Jeśli nie mamy ofert → próbuj dalej
  if (!currentOffers || currentOffers.length === 0) {
    return true;
  }
  
  // Jeśli mamy < 10 ofert → próbuj dalej (za mało)
  if (currentOffers.length < 10) {
    return true;
  }
  
  // Jeśli mamy >= 50 ofert → sprawdź jakość
  if (currentOffers.length >= 50) {
    // Oblicz średni deal score
    const scores = currentOffers
      .map(o => o._dealScore?.dealScore || 0)
      .filter(s => s > 0);
    
    if (scores.length > 0) {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      
      // Jeśli średni score >= 7.0 → STOP (wystarczająco dobre)
      if (avgScore >= 7.0) {
        return false;
      }
    }
  }
  
  // Jeśli następne źródło jest bardzo drogie (> 10x droższe) → STOP
  if (nextSource && currentSource) {
    const currentCost = currentSource.cost || 0;
    const nextCost = nextSource.cost || 0;
    
    if (nextCost > currentCost * 10) {
      return false;
    }
  }
  
  // Default: próbuj dalej
  return true;
}

/**
 * Source statistics (dla monitoringu)
 */
const sourceStats = {
  cache: { requests: 0, cost: 0, offers: 0 },
  own_shops: { requests: 0, cost: 0, offers: 0 },
  searchapi: { requests: 0, cost: 0, offers: 0 },
  serpapi: { requests: 0, cost: 0, offers: 0 },
  crawler: { requests: 0, cost: 0, offers: 0 },
  mock: { requests: 0, cost: 0, offers: 0 }
};

function trackSourceUsage(sourceName, offerCount = 0) {
  if (!sourceStats[sourceName]) {
    sourceStats[sourceName] = { requests: 0, cost: 0, offers: 0 };
  }
  
  sourceStats[sourceName].requests++;
  sourceStats[sourceName].offers += offerCount;
  sourceStats[sourceName].cost += getSourceCost(sourceName, offerCount);
}

function getSourceStats() {
  const total = Object.values(sourceStats).reduce((sum, s) => ({
    requests: sum.requests + s.requests,
    cost: sum.cost + s.cost,
    offers: sum.offers + s.offers
  }), { requests: 0, cost: 0, offers: 0 });
  
  return {
    sources: sourceStats,
    total: {
      ...total,
      avgCostPerRequest: total.requests > 0 ? (total.cost / total.requests).toFixed(4) : 0,
      avgOffersPerRequest: total.requests > 0 ? (total.offers / total.requests).toFixed(1) : 0
    }
  };
}

function resetSourceStats() {
  Object.keys(sourceStats).forEach(key => {
    sourceStats[key] = { requests: 0, cost: 0, offers: 0 };
  });
}

module.exports = {
  SOURCE_PRIORITY,
  getSourceStrategy,
  getSourceCost,
  sortSourcesByPriority,
  shouldTryNextSource,
  trackSourceUsage,
  getSourceStats,
  resetSourceStats
};
