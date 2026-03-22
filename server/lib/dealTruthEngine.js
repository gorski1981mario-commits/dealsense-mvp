"use strict";

/**
 * DEAL TRUTH ENGINE
 * 
 * NAJWAŻNIEJSZE!
 * 
 * IS_REAL_DEAL = 
 *   same_product 
 *   AND trusted_seller 
 *   AND valid_price
 * 
 * ZERO FAKE POLICY:
 * Jeśli nie jesteś pewny → NIE pokazujesz
 */

const { matchToCanonical } = require('./canonicalProductEngine');
const { compareFingerprints, generateFingerprintFromName } = require('./productFingerprint');

/**
 * Sprawdź czy cena jest valid (nie suspicious)
 */
function isValidPrice(price, basePrice, priceDistribution = null) {
  if (!price || !basePrice) return false;
  
  // Cena musi być > 0
  if (price <= 0) return false;
  
  // Jeśli mamy price distribution, użyj jej
  if (priceDistribution) {
    const median = priceDistribution.median || basePrice;
    const minValid = median * 0.3; // Min 30% mediany (refurbished, wyprzedaże)
    const maxValid = median * 2.0; // Max 200% mediany
    
    if (price < minValid || price > maxValid) {
      return false; // Suspicious price
    }
  } else {
    // Fallback: użyj basePrice
    const minValid = basePrice * 0.3; // Min 30% basePrice (refurbished OK)
    const maxValid = basePrice * 2.0; // Max 200% basePrice
    
    if (price < minValid || price > maxValid) {
      return false;
    }
  }
  
  return true;
}

/**
 * Sprawdź czy sklep jest trusted
 */
function isTrustedSeller(seller, trustScore = null) {
  if (!seller) return false;
  
  // Jeśli mamy trust score, użyj go
  if (trustScore !== null) {
    return trustScore >= 50; // Min trust 50
  }
  
  // Fallback: check seller name
  const sellerLower = seller.toLowerCase();
  
  // Trusted sellers (whitelist)
  const trustedSellers = [
    'bol.com',
    'coolblue',
    'mediamarkt',
    'amazon',
    'alternate',
    'belsimpel',
    'wehkamp',
    'de bijenkorf'
  ];
  
  for (const trusted of trustedSellers) {
    if (sellerLower.includes(trusted)) {
      return true;
    }
  }
  
  // Untrusted sellers (blacklist)
  const untrustedSellers = [
    'ebay',
    'marktplaats',
    'aliexpress',
    'wish',
    'temu'
  ];
  
  for (const untrusted of untrustedSellers) {
    if (sellerLower.includes(untrusted)) {
      return false;
    }
  }
  
  // Default: neutral (allow)
  return true;
}

/**
 * Sprawdź czy to ten sam produkt
 */
function isSameProduct(offer, canonicalProduct, minTier = 2) {
  const matchResult = matchToCanonical(offer, canonicalProduct);
  
  // Musi być tier <= minTier (1 lub 2)
  return matchResult.match && matchResult.tier !== null && matchResult.tier <= minTier;
}

/**
 * Sprawdź czy to REAL DEAL
 */
function isRealDeal(offer, canonicalProduct, options = {}) {
  const {
    basePrice = null,
    priceDistribution = null,
    minTier = 3, // Pozwól Tier 3 (fuzzy match)
    requireTrustedSeller = false // Poluzuj - pozwól niektóre untrusted
  } = options;
  
  // 1. Same product?
  const sameProduct = isSameProduct(offer, canonicalProduct, minTier);
  if (!sameProduct) {
    return {
      isReal: false,
      reason: 'Not the same product',
      checks: {
        sameProduct: false,
        trustedSeller: null,
        validPrice: null
      }
    };
  }
  
  // 2. Trusted seller?
  const trustScore = offer._dealScore?.trustScore || null;
  const trustedSeller = isTrustedSeller(offer.seller, trustScore);
  
  if (requireTrustedSeller && !trustedSeller) {
    return {
      isReal: false,
      reason: 'Untrusted seller',
      checks: {
        sameProduct: true,
        trustedSeller: false,
        validPrice: null
      }
    };
  }
  
  // 3. Valid price?
  const validPrice = isValidPrice(offer.price, basePrice, priceDistribution);
  if (!validPrice) {
    return {
      isReal: false,
      reason: 'Suspicious price',
      checks: {
        sameProduct: true,
        trustedSeller: trustedSeller,
        validPrice: false
      }
    };
  }
  
  // ✅ ALL CHECKS PASSED
  return {
    isReal: true,
    reason: 'Real deal',
    checks: {
      sameProduct: true,
      trustedSeller: trustedSeller,
      validPrice: true
    }
  };
}

/**
 * Filtruj oferty - ZERO FAKE POLICY
 */
function filterRealDeals(offers, canonicalProduct, options = {}) {
  if (!offers || !Array.isArray(offers)) return [];
  
  const realDeals = offers.filter(offer => {
    const result = isRealDeal(offer, canonicalProduct, options);
    
    // Dodaj metadata
    offer._dealTruth = result;
    
    return result.isReal;
  });
  
  return realDeals;
}

/**
 * Pobierz statystyki Deal Truth
 */
function getDealTruthStats(offers, canonicalProduct, options = {}) {
  if (!offers || !Array.isArray(offers)) {
    return {
      total: 0,
      realDeals: 0,
      fakeDeals: 0,
      reasons: {}
    };
  }
  
  const stats = {
    total: offers.length,
    realDeals: 0,
    fakeDeals: 0,
    reasons: {}
  };
  
  offers.forEach(offer => {
    const result = isRealDeal(offer, canonicalProduct, options);
    
    if (result.isReal) {
      stats.realDeals++;
    } else {
      stats.fakeDeals++;
      
      // Count reasons
      if (!stats.reasons[result.reason]) {
        stats.reasons[result.reason] = 0;
      }
      stats.reasons[result.reason]++;
    }
  });
  
  return stats;
}

module.exports = {
  isValidPrice,
  isTrustedSeller,
  isSameProduct,
  isRealDeal,
  filterRealDeals,
  getDealTruthStats
};
