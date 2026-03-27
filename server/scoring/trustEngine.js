"use strict";

/**
 * TRUST ENGINE - Ocena wiarygodności sklepu (0-100)
 * 
 * KRYTYCZNE: Long-tail boost TYLKO jeśli trust_score >= 50
 * Niszowe sklepy = największe przebicia, ALE muszą być zaufane!
 */

function getDomainAge(url) {
  // TODO: Integracja z WHOIS API lub database
  // Na razie heurystyka: znane domeny = stare
  const knownOldDomains = [
    'bol.com', 'coolblue.nl', 'mediamarkt.nl', 'amazon.nl',
    'wehkamp.nl', 'alternate.nl', 'azerty.nl', 'paradigit.nl',
    'bcc.nl', 'expert.nl', 'beslist.nl'
  ];
  
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (knownOldDomains.some(d => hostname.includes(d))) {
      return 5; // 5+ lat
    }
    return 1; // Nieznana = zakładamy młoda
  } catch {
    return 0;
  }
}

function hasHTTPS(url) {
  if (!url || typeof url !== 'string') return false;
  return url.trim().toLowerCase().startsWith('https://');
}

function hasReturnPolicy(offer) {
  // Heurystyka: duże sklepy mają politykę zwrotów
  const seller = (offer.seller || '').toLowerCase();
  const knownWithReturns = [
    'bol.com', 'coolblue', 'mediamarkt', 'amazon',
    'wehkamp', 'alternate', 'bcc', 'expert'
  ];
  
  return knownWithReturns.some(s => seller.includes(s));
}

function hasNLAddress(offer) {
  const seller = (offer.seller || '').toLowerCase();
  const url = (offer.url || '').toLowerCase();
  
  // Heurystyka: .nl domain lub znane NL sklepy
  if (url.includes('.nl')) return true;
  
  const nlShops = [
    'bol.com', 'coolblue', 'mediamarkt', 'wehkamp',
    'alternate', 'azerty', 'paradigit', 'bcc', 'expert',
    'beslist', 'gamma', 'praxis', 'karwei', 'blokker', 'hema'
  ];
  
  return nlShops.some(s => seller.includes(s) || url.includes(s));
}

/**
 * Oblicza Trust Score dla oferty (0-100)
 * 
 * LOGIKA: Sklep > Produkt
 * Jeśli sklep jest zaufany, produkt też jest zaufany (nawet z niskimi reviews)
 * 
 * @param {Object} offer - Oferta z danymi sklepu
 * @returns {number} Trust score 0-100
 */
function getTrustScore(offer) {
  if (!offer || typeof offer !== 'object') {
    return 0;
  }
  
  const seller = (offer.seller || '').toLowerCase();
  
  // TRUSTED SELLERS - sklepy NL które ZAWSZE są OK
  const trustedSellers = [
    'bol.com', 'coolblue', 'mediamarkt', 'amazon.nl', 'alternate',
    'belsimpel', 'wehkamp', 'de bijenkorf', 'expert', 'azerty',
    'paradigit', 'centralpoint', 'informatique', 'mycom',
    'gamma', 'praxis', 'karwei', 'hornbach', 'intratuin',
    'ikea', 'hema', 'blokker', 'action', 'fonq',
    'decathlon', 'intersport', 'perry sport', 'aktiesport',
    'zalando', 'aboutyou', 'douglas', 'rituals'
  ];
  
  const isTrustedSeller = trustedSellers.some(trusted => seller.includes(trusted));
  
  // KLUCZOWA ZMIANA: Jeśli sklep jest trusted, ZAWSZE dostaje wysoki score
  // Nie ma znaczenia ile ma reviews produkt - dobry sklep = dobry produkt
  let score = isTrustedSeller ? 85 : 0;
  
  // 1. HTTPS (20 punktów)
  if (hasHTTPS(offer.url)) {
    score += 20;
  }
  
  // 2. Opinie (30 punktów max)
  const rating = typeof offer.reviewScore === 'number' ? offer.reviewScore : 0;
  const reviews = typeof offer.reviewCount === 'number' ? offer.reviewCount : 0;
  
  if (rating >= 4.5 && reviews >= 10) {
    score += 30;
  } else if (rating >= 4.0 && reviews >= 5) {
    score += 20;
  } else if (rating >= 3.5 && reviews >= 1) {
    score += 10;
  }
  
  // 3. Wiek domeny (20 punktów)
  const age = getDomainAge(offer.url || '');
  if (age >= 5) {
    score += 20;
  } else if (age >= 2) {
    score += 10;
  } else if (age >= 1) {
    score += 5;
  }
  
  // 4. Polityka zwrotów (15 punktów)
  if (hasReturnPolicy(offer)) {
    score += 15;
  }
  
  // 5. Adres NL (15 punktów)
  if (hasNLAddress(offer)) {
    score += 15;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Sprawdza czy oferta jest trusted
 * 
 * ORYGINALNY SYSTEM: Trust minimum = 50
 * Tylko sprawdzone sklepy z dobrą reputacją
 * Średnia 4.0+ reviews, HTTPS, polityka zwrotów
 */
function isTrusted(offer) {
  const score = getTrustScore(offer);
  
  // THRESHOLD = 50 - tylko sprawdzone sklepy
  // Eliminuje scam, podejrzane sklepy, nowe domeny
  return score >= 50;
}

/**
 * Sprawdza czy sklep jest niszowy
 * Niszowy = mało recenzji ALE dobry rating
 * 
 * FINALNE PARAMETRY (22 marca 2026):
 * - reviews < 50 && rating >= 4.0 (PRODUCTION READY)
 */
function isNicheShop(offer) {
  if (!offer || typeof offer !== 'object') return false;
  
  const reviews = typeof offer.reviewCount === 'number' ? offer.reviewCount : 0;
  const rating = typeof offer.reviewScore === 'number' ? offer.reviewScore : 0;
  
  // Niszowy: < 50 recenzji ALE rating >= 4.0 (FINALNE)
  return reviews < 50 && rating >= 4.0;
}

module.exports = {
  getTrustScore,
  isTrusted,
  isNicheShop,
  hasHTTPS,
  hasReturnPolicy,
  hasNLAddress,
  getDomainAge
};
