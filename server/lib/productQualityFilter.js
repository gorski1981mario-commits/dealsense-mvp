"use strict";

/**
 * PRODUCT QUALITY FILTER - TYLKO NOWE, DOKŁADNE PRODUKTY
 * 
 * Pipeline (8 kroków):
 * 1. fetch results
 * 2. keyword filter (śmieci OUT)
 * 3. category filter
 * 4. spec match (exact)
 * 5. similarity score (>85%)
 * 6. trust filter
 * 7. price sanity check
 * 8. dealscore (w market-api.js)
 * 
 * ELIMINUJE:
 * - Refurbished, used, renewed, tweedehands
 * - Akcesoria (case, cover, glass, etc.)
 * - Złe modele (iPhone 14 gdy szukasz 15)
 * - Złe specki (128GB ≠ 256GB, Pro ≠ normal)
 * - Bundles, outlet deals, demo units
 * - Podejrzane ceny (<50% median)
 * - Sklepy bez HTTPS, opinie, red flags
 */

// ============================================================================
// 1. HARD FILTERS - SŁOWA ZAKAZANE
// ============================================================================

const BANNED_KEYWORDS = {
  // Akcesoria
  accessories: [
    'case', 'hoesje', 'cover', 'glass', 'screenprotector',
    'accessory', 'houder', 'mount', 'adapter', 'kabel',
    'cable', 'charger', 'oplader', 'tempered glass',
    'screen protector', 'hoes', 'etui', 'bumper',
    'stand', 'bracket', 'clip', 'strap'
  ],
  
  // Stan (używane/odnowione)
  condition: [
    'refurbished', 'renewed', 'used', 'tweedehands',
    'gebruikt', 'occasion', 'second hand', 'secondhand',
    'refurb', 'reconditioned', 'gereviseerd', 'als nieuw',
    'demo', 'display', 'showmodel', 'outlet'
  ],
  
  // Bundles
  bundles: [
    'bundle', 'bundel', 'set', 'combo', 'package',
    'pakket', '+ case', '+ cover', '+ adapter',
    'inclusief', 'including', 'with case', 'met case',
    'avec', 'avec case', 'avec cover', 'avec adapter',
    'kit', 'starter kit', 'pack', 'duo', 'trio'
  ]
};

// ============================================================================
// 2. PRODUCT IDENTITY EXTRACTION
// ============================================================================

/**
 * Wyciąga kluczowe cechy produktu z nazwy
 */
function extractProductIdentity(productName, ean) {
  const name = String(productName || '').toLowerCase();
  
  const identity = {
    brand: null,
    model: null,
    storage: null,
    color: null,
    version: null,
    category: null
  };
  
  // Brand
  const brands = {
    'apple': 'apple',
    'samsung': 'samsung',
    'sony': 'sony',
    'lg': 'lg',
    'philips': 'philips',
    'dyson': 'dyson',
    'delonghi': 'delonghi',
    'nike': 'nike',
    'adidas': 'adidas',
    'lego': 'lego',
    'playstation': 'sony',
    'xbox': 'microsoft'
  };
  
  for (const [key, value] of Object.entries(brands)) {
    if (name.includes(key)) {
      identity.brand = value;
      break;
    }
  }
  
  // Model (przykłady - rozszerz według potrzeb)
  if (name.includes('iphone 15 pro max')) identity.model = 'iphone_15_pro_max';
  else if (name.includes('iphone 15 pro')) identity.model = 'iphone_15_pro';
  else if (name.includes('iphone 15')) identity.model = 'iphone_15';
  else if (name.includes('iphone 14')) identity.model = 'iphone_14';
  else if (name.includes('galaxy s24 ultra')) identity.model = 'galaxy_s24_ultra';
  else if (name.includes('galaxy s24')) identity.model = 'galaxy_s24';
  else if (name.includes('playstation 5')) identity.model = 'ps5';
  else if (name.includes('airpods pro 2')) identity.model = 'airpods_pro_2';
  
  // Storage
  const storageMatch = name.match(/(\d+)\s?(gb|tb)/i);
  if (storageMatch) {
    identity.storage = storageMatch[1] + storageMatch[2].toLowerCase();
  }
  
  // Color
  const colors = ['black', 'white', 'blue', 'red', 'green', 'zwart', 'wit', 'blauw', 'rood', 'groen'];
  for (const color of colors) {
    if (name.includes(color)) {
      identity.color = color;
      break;
    }
  }
  
  // Version (EU/US/NL)
  if (name.includes(' eu ') || name.includes('europe')) identity.version = 'eu';
  if (name.includes(' us ') || name.includes('usa')) identity.version = 'us';
  if (name.includes(' nl ') || name.includes('nederland')) identity.version = 'nl';
  
  // Category
  if (name.includes('iphone') || name.includes('galaxy') || name.includes('smartphone')) {
    identity.category = 'smartphone';
  } else if (name.includes('playstation') || name.includes('xbox') || name.includes('console')) {
    identity.category = 'gaming';
  } else if (name.includes('airpods') || name.includes('headphone') || name.includes('koptelefoon')) {
    identity.category = 'audio';
  }
  
  return identity;
}

// ============================================================================
// 3. KEYWORD FILTER (KROK 2)
// ============================================================================

/**
 * Sprawdza czy oferta zawiera zakazane słowa
 */
function hasBannedKeywords(offer) {
  const title = String(offer.title || '').toLowerCase();
  const description = String(offer.description || '').toLowerCase();
  const text = title + ' ' + description;
  
  // Sprawdź wszystkie kategorie zakazanych słów
  for (const category of Object.values(BANNED_KEYWORDS)) {
    for (const keyword of category) {
      if (text.includes(keyword)) {
        return { banned: true, reason: `Banned keyword: ${keyword}`, keyword };
      }
    }
  }
  
  return { banned: false };
}

// ============================================================================
// 4. SPEC MATCH (KROK 4)
// ============================================================================

/**
 * Sprawdza czy specyfikacja oferty pasuje DOKŁADNIE do szukanego produktu
 */
function checkSpecMatch(offerIdentity, masterIdentity) {
  const issues = [];
  
  // Brand musi się zgadzać
  if (masterIdentity.brand && offerIdentity.brand !== masterIdentity.brand) {
    issues.push(`Wrong brand: ${offerIdentity.brand} vs ${masterIdentity.brand}`);
  }
  
  // Model musi się zgadzać
  if (masterIdentity.model && offerIdentity.model !== masterIdentity.model) {
    issues.push(`Wrong model: ${offerIdentity.model} vs ${masterIdentity.model}`);
  }
  
  // Storage musi się zgadzać (128GB ≠ 256GB)
  if (masterIdentity.storage && offerIdentity.storage !== masterIdentity.storage) {
    issues.push(`Wrong storage: ${offerIdentity.storage} vs ${masterIdentity.storage}`);
  }
  
  // Version musi się zgadzać (EU ≠ US)
  if (masterIdentity.version && offerIdentity.version && offerIdentity.version !== masterIdentity.version) {
    issues.push(`Wrong version: ${offerIdentity.version} vs ${masterIdentity.version}`);
  }
  
  return {
    match: issues.length === 0,
    issues
  };
}

// ============================================================================
// 5. SIMILARITY SCORE (KROK 5)
// ============================================================================

/**
 * Oblicza similarity score (0-100%) - SMART MATCHING
 * Ignoruje common words, skupia się na kluczowych tokenach
 */
function calculateSimilarity(offerTitle, masterProductName) {
  const offer = String(offerTitle || '').toLowerCase();
  const master = String(masterProductName || '').toLowerCase();
  
  // Common words do ignorowania (nie są kluczowe)
  const commonWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'inch', 'cm', 'mm', 'gb', 'tb', 'generation', 'gen', 'new', 'nieuw',
    'original', 'official', 'authentic', 'genuine', 'sealed', 'box',
    'warranty', 'garantie', 'year', 'jaar', 'month', 'maand'
  ];
  
  // Tokenizacja - usuń common words
  const offerTokens = offer.split(/\s+/)
    .filter(t => t.length > 2)
    .filter(t => !commonWords.includes(t));
  
  const masterTokens = master.split(/\s+/)
    .filter(t => t.length > 2)
    .filter(t => !commonWords.includes(t));
  
  if (masterTokens.length === 0) return 0;
  
  // Ile kluczowych tokenów z master jest w offer?
  let matches = 0;
  for (const token of masterTokens) {
    if (offerTokens.some(t => t.includes(token) || token.includes(t))) {
      matches++;
    }
  }
  
  const similarity = (matches / masterTokens.length) * 100;
  return Math.round(similarity);
}

// ============================================================================
// 6. TRUST FILTER (KROK 6)
// ============================================================================

/**
 * Sprawdza czy sklep jest zaufany
 */
function checkSellerTrust(offer) {
  const seller = String(offer.seller || '').toLowerCase();
  const url = String(offer.url || '').toLowerCase();
  
  const issues = [];
  
  // Minimalne warunki:
  // 1. Sklep NL/EU
  const nlEuDomains = ['.nl', '.be', '.de', '.fr', '.eu', 'bol.com', 'coolblue', 'wehkamp', 'amazon'];
  const hasNlEu = nlEuDomains.some(d => url.includes(d) || seller.includes(d));
  if (!hasNlEu) {
    issues.push('Not NL/EU shop');
  }
  
  // 2. HTTPS
  if (!url.startsWith('https://')) {
    issues.push('No HTTPS');
  }
  
  // 3. Opinie (jeśli dostępne)
  const hasReviews = offer.reviewCount && offer.reviewCount > 0;
  if (!hasReviews) {
    issues.push('No reviews');
  }
  
  // 4. Red flags
  const redFlags = ['scam', 'fake', 'replica', 'copy'];
  for (const flag of redFlags) {
    if (seller.includes(flag) || url.includes(flag)) {
      issues.push(`Red flag: ${flag}`);
    }
  }
  
  return {
    trusted: issues.length === 0,
    issues
  };
}

// ============================================================================
// 7. PRICE SANITY CHECK (KROK 7)
// ============================================================================

/**
 * Sprawdza czy cena nie jest podejrzanie niska
 */
function checkPriceSanity(offers, basePrice) {
  if (!offers || offers.length === 0) return offers;
  
  // Oblicz medianę cen
  const prices = offers
    .map(o => o.price)
    .filter(p => p && p > 0)
    .sort((a, b) => a - b);
  
  if (prices.length === 0) return offers;
  
  const median = prices[Math.floor(prices.length / 2)];
  const threshold = median * 0.5; // 50% mediany
  
  // Flaguj podejrzane oferty
  return offers.map(offer => {
    if (offer.price < threshold) {
      offer._suspicious = true;
      offer._suspiciousReason = `Price too low: €${offer.price} < 50% median (€${median})`;
    }
    return offer;
  });
}

// ============================================================================
// 8. GŁÓWNA FUNKCJA FILTROWANIA
// ============================================================================

/**
 * Filtruje oferty według wszystkich kryteriów jakości
 * 
 * @param {Array} offers - Surowe oferty z SearchAPI
 * @param {string} productName - Nazwa szukanego produktu
 * @param {string} ean - EAN produktu (opcjonalnie)
 * @param {Object} options - Opcje filtrowania
 * @returns {Object} { filtered: Array, stats: Object }
 */
function filterProductQuality(offers, productName, ean = null, options = {}) {
  if (!Array.isArray(offers) || offers.length === 0) {
    return { filtered: [], stats: {}, mode: 'none' };
  }
  
  const {
    minSimilarity = 60, // Minimum 60% similarity (poluzowane z 85%)
    allowSuspicious = false, // Czy pokazywać podejrzane oferty?
    strictMode = true, // Strict mode = wszystkie filtry aktywne
    adaptiveMode = true // Adaptive mode = próbuj balanced jeśli strict zwraca 0
  } = options;
  
  // ADAPTIVE MODE: Najpierw strict, potem balanced
  if (adaptiveMode) {
    // Próba 1: STRICT MODE
    const strictResult = filterWithMode(offers, productName, ean, {
      ...options,
      minSimilarity: 60, // Poluzowane z 85%
      strictMode: true,
      adaptiveMode: false // Wyłącz rekurencję
    });
    
    if (strictResult.filtered.length > 0) {
      strictResult.mode = 'strict';
      return strictResult;
    }
    
    // Próba 2: BALANCED MODE (jeśli strict zwrócił 0)
    const balancedResult = filterWithMode(offers, productName, ean, {
      ...options,
      minSimilarity: 50, // Niższy próg (było 75)
      strictMode: false, // Wyłącz trust filter
      adaptiveMode: false
    });
    
    if (balancedResult.filtered.length > 0) {
      balancedResult.mode = 'balanced';
      balancedResult.adaptiveFallback = true;
      return balancedResult;
    }
    
    // Brak ofert nawet w balanced mode
    return {
      filtered: [],
      stats: balancedResult.stats,
      mode: 'none',
      warning: 'No offers found even with relaxed filters'
    };
  }
  
  // Bez adaptive mode - użyj podanych ustawień
  return filterWithMode(offers, productName, ean, options);
}

/**
 * Wewnętrzna funkcja filtrowania z konkretnym trybem
 */
function filterWithMode(offers, productName, ean, options) {
  const {
    minSimilarity = 60, // Poluzowane z 85%
    allowSuspicious = false,
    strictMode = true
  } = options;
  
  // Wyciągnij master product identity
  const masterIdentity = extractProductIdentity(productName, ean);
  
  const stats = {
    total: offers.length,
    bannedKeywords: 0,
    wrongSpec: 0,
    lowSimilarity: 0,
    untrusted: 0,
    suspicious: 0,
    passed: 0
  };
  
  let filtered = offers;
  
  // KROK 2: Keyword filter
  filtered = filtered.filter(offer => {
    const check = hasBannedKeywords(offer);
    if (check.banned) {
      stats.bannedKeywords++;
      offer._filterReason = check.reason;
      return false;
    }
    return true;
  });
  
  // KROK 4: Spec match (jeśli strict mode)
  if (strictMode && (masterIdentity.brand || masterIdentity.model || masterIdentity.storage)) {
    filtered = filtered.filter(offer => {
      const offerIdentity = extractProductIdentity(offer.title, null);
      const specCheck = checkSpecMatch(offerIdentity, masterIdentity);
      
      if (!specCheck.match) {
        stats.wrongSpec++;
        offer._filterReason = `Spec mismatch: ${specCheck.issues.join(', ')}`;
        return false;
      }
      return true;
    });
  }
  
  // KROK 5: Similarity score
  filtered = filtered.map(offer => {
    offer._similarity = calculateSimilarity(offer.title, productName);
    return offer;
  }).filter(offer => {
    if (offer._similarity < minSimilarity) {
      stats.lowSimilarity++;
      offer._filterReason = `Low similarity: ${offer._similarity}% < ${minSimilarity}%`;
      return false;
    }
    return true;
  });
  
  // KROK 6: Trust filter (jeśli strict mode)
  if (strictMode) {
    filtered = filtered.map(offer => {
      const trustCheck = checkSellerTrust(offer);
      offer._trustIssues = trustCheck.issues;
      offer._trusted = trustCheck.trusted;
      return offer;
    }).filter(offer => {
      if (!offer._trusted) {
        stats.untrusted++;
        offer._filterReason = `Untrusted: ${offer._trustIssues.join(', ')}`;
        return false;
      }
      return true;
    });
  }
  
  // KROK 7: Price sanity check
  filtered = checkPriceSanity(filtered, options.basePrice);
  
  if (!allowSuspicious) {
    filtered = filtered.filter(offer => {
      if (offer._suspicious) {
        stats.suspicious++;
        offer._filterReason = offer._suspiciousReason;
        return false;
      }
      return true;
    });
  }
  
  stats.passed = filtered.length;
  
  return {
    filtered,
    stats,
    masterIdentity
  };
}

// Zamknięcie funkcji filterWithMode
// (cała logika filtrowania jest już w środku)

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  filterProductQuality,
  extractProductIdentity,
  hasBannedKeywords,
  checkSpecMatch,
  calculateSimilarity,
  checkSellerTrust,
  checkPriceSanity
};
