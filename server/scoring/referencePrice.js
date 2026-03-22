"use strict";

/**
 * REFERENCE PRICE ENGINE
 * 
 * NIE bierzemy ceny usera jako prawdy!
 * Obliczamy reference price z wielu źródeł (mediana)
 * 
 * User może podać €1200, ale prawdziwa cena rynkowa to €999
 * Wtedy €1000 NIE jest okazją!
 */

/**
 * Oblicza medianę z array liczb
 */
function median(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return null;
  
  const sorted = numbers.filter(n => typeof n === 'number' && Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  
  if (sorted.length === 0) return null;
  
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Oblicza średnią z array liczb
 */
function average(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return null;
  
  const valid = numbers.filter(n => typeof n === 'number' && Number.isFinite(n) && n > 0);
  
  if (valid.length === 0) return null;
  
  const sum = valid.reduce((acc, n) => acc + n, 0);
  return sum / valid.length;
}

/**
 * Ekstraktuje ceny z ofert
 */
function extractPrices(offers) {
  if (!Array.isArray(offers)) return [];
  
  return offers
    .map(o => o && typeof o.price === 'number' ? o.price : null)
    .filter(p => p !== null && p > 0);
}

/**
 * Znajduje najniższą cenę w ofercie
 */
function getLowestPrice(offers) {
  const prices = extractPrices(offers);
  return prices.length > 0 ? Math.min(...prices) : null;
}

/**
 * Znajduje najwyższą cenę w ofercie
 */
function getHighestPrice(offers) {
  const prices = extractPrices(offers);
  return prices.length > 0 ? Math.max(...prices) : null;
}

/**
 * Oblicza reference price z ofert (mediana)
 * 
 * Mediana = najbardziej wiarygodna (odporna na outliers)
 */
function getReferencePrice(offers, userBasePrice = null) {
  // Jeśli nie mamy ofert → użyj userBasePrice jako fallback
  if (!Array.isArray(offers) || offers.length === 0) {
    return userBasePrice || null;
  }
  
  const prices = extractPrices(offers);
  
  if (prices.length === 0) {
    return userBasePrice && typeof userBasePrice === 'number' && userBasePrice > 0 
      ? userBasePrice 
      : null;
  }
  
  // Oblicz medianę
  const med = median(prices);
  
  // Jeśli user podał cenę, sprawdź czy nie jest outlierem
  if (userBasePrice && typeof userBasePrice === 'number' && userBasePrice > 0) {
    const avg = average(prices);
    
    // Jeśli cena usera jest > 150% średniej → prawdopodobnie zawyżona
    if (userBasePrice > avg * 1.5) {
      console.log(`[ReferencePrice] User price €${userBasePrice} seems inflated (avg: €${avg.toFixed(2)}), using median €${med.toFixed(2)}`);
      return med;
    }
    
    // Jeśli cena usera jest < 50% średniej → prawdopodobnie zaniżona
    if (userBasePrice < avg * 0.5) {
      console.log(`[ReferencePrice] User price €${userBasePrice} seems too low (avg: €${avg.toFixed(2)}), using median €${med.toFixed(2)}`);
      return med;
    }
    
    // Cena usera jest OK → użyj mediany z user price
    const refPrice = median([...prices, userBasePrice]);
    // FALLBACK: Jeśli median = 0 lub null, użyj userBasePrice
    if (!refPrice || refPrice <= 0) {
      return userBasePrice || null;
    }
    
    return refPrice;
  }
  
  return med;
}

/**
 * Oblicza market average (średnia)
 */
function getMarketAverage(offers) {
  const prices = extractPrices(offers);
  return average(prices);
}

/**
 * Sprawdza czy cena jest outlierem (podejrzanie niska/wysoka)
 */
function isPriceOutlier(price, offers) {
  if (!price || typeof price !== 'number') return false;
  if (!Array.isArray(offers) || offers.length === 0) return false;
  
  const avg = getMarketAverage(offers);
  if (!avg) return false;
  
  // Outlier jeśli < 30% średniej LUB > 200% średniej
  return price < avg * 0.3 || price > avg * 2.0;
}

module.exports = {
  getReferencePrice,
  getMarketAverage,
  getLowestPrice,
  getHighestPrice,
  extractPrices,
  isPriceOutlier,
  median,
  average
};
