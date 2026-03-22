"use strict";

/**
 * PRODUCT FINGERPRINT
 * 
 * GAMECHANGER!
 * 
 * Nie polegasz tylko na tekście - tworzysz "odcisk palca" produktu
 * 
 * fingerprint = hash(brand + model + specs + pattern)
 * 
 * Wykrywasz nawet różne nazwy tego samego produktu:
 * - "iPhone 15 Pro 128GB Black"
 * - "Apple iPhone 15 Pro 128GB Zwart"
 * - "iPhone 15Pro 128 GB Noir"
 * = TEN SAM PRODUKT ✅
 */

const crypto = require('crypto');
const { normalizeText, parseProductName } = require('./canonicalProductEngine');

/**
 * Generuj fingerprint produktu
 */
function generateFingerprint(brand, model, specs) {
  // Normalizuj wszystko
  const normalizedBrand = normalizeText(brand || '');
  const normalizedModel = normalizeText(model || '');
  const normalizedSpecs = normalizeText(specs || '');
  
  // Utwórz string do hashowania
  const fingerprintString = [
    normalizedBrand,
    normalizedModel,
    normalizedSpecs
  ]
    .filter(x => x)
    .join('|');
  
  // Hash (MD5 - szybszy niż SHA256, wystarczający dla fingerprint)
  const hash = crypto
    .createHash('md5')
    .update(fingerprintString)
    .digest('hex')
    .substring(0, 12); // Pierwsze 12 znaków
  
  return `FP_${hash}`;
}

/**
 * Generuj fingerprint z nazwy produktu
 */
function generateFingerprintFromName(productName, ean = null) {
  const parsed = parseProductName(productName, ean);
  
  const specs = [
    parsed.variant,
    parsed.color
  ]
    .filter(x => x)
    .join(' ');
  
  return generateFingerprint(parsed.brand, parsed.model, specs);
}

/**
 * Porównaj fingerprints (czy są podobne)
 */
function compareFingerprints(fingerprint1, fingerprint2) {
  if (!fingerprint1 || !fingerprint2) return false;
  
  // Exact match
  if (fingerprint1 === fingerprint2) return true;
  
  // Partial match (pierwsze 8 znaków)
  const fp1Short = fingerprint1.substring(0, 11); // FP_ + 8 chars
  const fp2Short = fingerprint2.substring(0, 11);
  
  return fp1Short === fp2Short;
}

/**
 * Grupuj oferty według fingerprint
 */
function groupByFingerprint(offers) {
  if (!offers || !Array.isArray(offers)) return {};
  
  const groups = {};
  
  offers.forEach(offer => {
    const offerName = offer.title || offer.name || '';
    const offerEan = offer.ean || null;
    
    const fingerprint = generateFingerprintFromName(offerName, offerEan);
    
    if (!groups[fingerprint]) {
      groups[fingerprint] = [];
    }
    
    groups[fingerprint].push({
      ...offer,
      _fingerprint: fingerprint
    });
  });
  
  return groups;
}

/**
 * Znajdź najbardziej popularny fingerprint (najwięcej ofert)
 */
function getMostPopularFingerprint(offers) {
  const groups = groupByFingerprint(offers);
  
  let maxCount = 0;
  let mostPopular = null;
  
  Object.keys(groups).forEach(fingerprint => {
    const count = groups[fingerprint].length;
    if (count > maxCount) {
      maxCount = count;
      mostPopular = fingerprint;
    }
  });
  
  return {
    fingerprint: mostPopular,
    count: maxCount,
    offers: mostPopular ? groups[mostPopular] : []
  };
}

/**
 * Filtruj oferty według fingerprint (tylko matching)
 */
function filterByFingerprint(offers, targetFingerprint) {
  if (!offers || !Array.isArray(offers)) return [];
  
  return offers.filter(offer => {
    const offerName = offer.title || offer.name || '';
    const offerEan = offer.ean || null;
    
    const fingerprint = generateFingerprintFromName(offerName, offerEan);
    
    return compareFingerprints(fingerprint, targetFingerprint);
  });
}

module.exports = {
  generateFingerprint,
  generateFingerprintFromName,
  compareFingerprints,
  groupByFingerprint,
  getMostPopularFingerprint,
  filterByFingerprint
};
