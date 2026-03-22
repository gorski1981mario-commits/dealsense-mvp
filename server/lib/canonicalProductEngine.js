"use strict";

/**
 * CANONICAL PRODUCT ENGINE
 * 
 * ŚWIĘTY GRAAL E-COMMERCE!
 * 
 * Przewaga NIE jest w znajdowaniu tanich ofert,
 * tylko w PEWNOŚCI że to TA SAMA rzecz!
 * 
 * CORE COMPONENTS:
 * 1. Canonical Product ID - unikalny identyfikator produktu
 * 2. Product Normalization - normalizacja nazw, specs, etc.
 * 3. Canonical Database - baza kanonicznych produktów
 * 4. Match to Canonical - dopasowanie ofert do kanonicznego produktu
 */

const crypto = require('crypto');

/**
 * Normalizuj tekst (lowercase, trim, remove special chars)
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Multiple spaces → single space
    .trim();
}

/**
 * Product-to-Brand Mapping
 * 
 * KLUCZOWE: Jeśli nazwa produktu zawiera specyficzny produkt,
 * automatycznie przypisz brand!
 * 
 * Przykład: "AirPods Pro 2" → brand = "apple"
 */
const PRODUCT_TO_BRAND = {
  // Apple Products
  'airpods': 'apple',
  'iphone': 'apple',
  'ipad': 'apple',
  'macbook': 'apple',
  'imac': 'apple',
  'mac mini': 'apple',
  'mac pro': 'apple',
  'apple watch': 'apple',
  'homepod': 'apple',
  'airtag': 'apple',
  
  // Samsung Products
  'galaxy': 'samsung',
  
  // Sony Products
  'playstation': 'sony',
  'ps5': 'sony',
  'ps4': 'sony',
  'bravia': 'sony',
  
  // Microsoft Products
  'xbox': 'microsoft',
  'surface': 'microsoft',
  
  // Nintendo Products
  'switch': 'nintendo',
  
  // Bosch Tools (model numbers)
  'gsr': 'bosch',
  'gbh': 'bosch',
  'gws': 'bosch',
  'gks': 'bosch',
  'gll': 'bosch',
  
  // DeWalt Tools (model numbers)
  'dcd': 'dewalt',
  'dcf': 'dewalt',
  'dcs': 'dewalt',
  'dch': 'dewalt',
  
  // Makita Tools (model numbers)
  'dhp': 'makita',
  'dhr': 'makita',
  'dga': 'makita',
  'dhs': 'makita',
  
  // Milwaukee Tools (model numbers)
  'hd18': 'milwaukee',
  'm18': 'milwaukee',
  
  // Dyson Products
  'v15': 'dyson',
  'v12': 'dyson',
  'v11': 'dyson',
  'v10': 'dyson',
  'v8': 'dyson',
  
  // Philips Products
  'airfryer': 'philips',
  'hue': 'philips',
  'sonicare': 'philips',
  
  // Oral-B Products
  'oral-b': 'oral-b',
  'oralb': 'oral-b',
  
  // Garmin Products
  'forerunner': 'garmin',
  'fenix': 'garmin',
  'vivoactive': 'garmin',
  
  // GoPro Products
  'hero': 'gopro',
  
  // LEGO Products
  'lego': 'lego',
  
  // Nike Products
  'air max': 'nike',
  'air force': 'nike',
  'air jordan': 'nike',
  
  // Adidas Products
  'ultraboost': 'adidas',
  'stan smith': 'adidas',
  'superstar': 'adidas'
};

/**
 * Wyciągnij brand z nazwy produktu
 * 
 * NOWA LOGIKA:
 * 1. Sprawdź product-to-brand mapping NAJPIERW
 * 2. Sprawdź direct brand match
 */
function extractBrand(productName) {
  const input = (productName || '').toLowerCase();
  
  // 1. PRODUCT-TO-BRAND MAPPING (PRIORYTET!)
  for (const [product, brand] of Object.entries(PRODUCT_TO_BRAND)) {
    if (input.includes(product)) {
      return brand;
    }
  }
  
  // 2. DIRECT BRAND MATCH (fallback)
  const brands = [
    'apple', 'samsung', 'sony', 'lg', 'philips', 'bose', 'jbl', 'logitech',
    'microsoft', 'dell', 'hp', 'asus', 'acer', 'lenovo', 'huawei', 'xiaomi',
    'nike', 'adidas', 'puma', 'reebok', 'new balance', 'asics', 'under armour',
    'levi\'s', 'tommy hilfiger', 'calvin klein', 'the north face', 'patagonia',
    'bosch', 'makita', 'dewalt', 'milwaukee', 'metabo', 'hilti', 'festool',
    'dyson', 'karcher', 'siemens', 'miele', 'whirlpool', 'delonghi',
    'garmin', 'polar', 'fitbit', 'oral-b', 'braun', 'canon', 'nikon',
    'lego', 'playmobil', 'mattel', 'hasbro', 'ravensburger',
    'bmw', 'mercedes', 'audi', 'volkswagen', 'vw', 'ford', 'toyota', 'honda',
    'gopro'
  ];
  
  // Znajdź brand w nazwie
  for (const brand of brands) {
    if (input.includes(brand)) {
      return brand;
    }
  }
  
  return null;
}

/**
 * Wyciągnij model z nazwy produktu (po usunięciu brandu)
 */
function extractModel(productName, brand) {
  let model = normalizeText(productName);
  
  // Usuń brand
  if (brand) {
    model = model.replace(new RegExp(brand, 'gi'), '').trim();
  }
  
  // Usuń common words
  const commonWords = ['the', 'and', 'or', 'with', 'voor', 'met', 'en', 'of'];
  commonWords.forEach(word => {
    model = model.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
  });
  
  // Clean up
  model = model.replace(/\s+/g, ' ').trim();
  
  return model;
}

/**
 * Wyciągnij variant (np. 128GB, 256GB, etc.)
 */
function extractVariant(productName) {
  const input = productName || '';
  
  // Storage variants
  const storageMatch = input.match(/\b(8|16|32|64|128|256|512|1024|1|2|4)(\s)?(gb|tb)\b/i);
  if (storageMatch) {
    return storageMatch[0].toUpperCase();
  }
  
  // Size variants (clothing)
  const sizeMatch = input.match(/\b(xs|s|m|l|xl|xxl|xxxl)\b/i);
  if (sizeMatch) {
    return sizeMatch[0].toUpperCase();
  }
  
  // Numeric size (shoes)
  const numericSizeMatch = input.match(/\bsize\s*([0-9]{2})\b/i);
  if (numericSizeMatch) {
    return `SIZE ${numericSizeMatch[1]}`;
  }
  
  return null;
}

/**
 * Wyciągnij kolor
 */
function extractColor(productName) {
  const input = (productName || '').toLowerCase();
  
  const colors = {
    'black': ['black', 'zwart', 'noir', 'schwarz'],
    'white': ['white', 'wit', 'blanc', 'weiss'],
    'red': ['red', 'rood', 'rouge', 'rot'],
    'blue': ['blue', 'blauw', 'bleu', 'blau'],
    'green': ['green', 'groen', 'vert', 'grün'],
    'yellow': ['yellow', 'geel', 'jaune', 'gelb'],
    'grey': ['grey', 'gray', 'grijs', 'gris', 'grau'],
    'silver': ['silver', 'zilver', 'argent', 'silber'],
    'gold': ['gold', 'goud', 'or']
  };
  
  for (const [canonical, variants] of Object.entries(colors)) {
    for (const variant of variants) {
      if (input.includes(variant)) {
        return canonical;
      }
    }
  }
  
  return null;
}

/**
 * Parsuj nazwę produktu na komponenty
 */
function parseProductName(productName, ean = null) {
  const brand = extractBrand(productName);
  const model = extractModel(productName, brand);
  const variant = extractVariant(productName);
  const color = extractColor(productName);
  
  return {
    brand,
    model,
    variant,
    color,
    ean,
    raw: productName
  };
}

/**
 * Utwórz Canonical Product ID
 */
function createCanonicalProductId(brand, model, variant, color, ean) {
  // Normalizuj wszystko
  const normalizedBrand = normalizeText(brand || '');
  const normalizedModel = normalizeText(model || '');
  const normalizedVariant = normalizeText(variant || '');
  const normalizedColor = normalizeText(color || '');
  const normalizedEan = (ean || '').trim();
  
  // Utwórz string do hashowania
  const canonicalString = [
    normalizedBrand,
    normalizedModel,
    normalizedVariant,
    normalizedColor,
    normalizedEan
  ]
    .filter(x => x)
    .join('|');
  
  // Hash (SHA256)
  const hash = crypto
    .createHash('sha256')
    .update(canonicalString)
    .digest('hex')
    .substring(0, 16); // Pierwsze 16 znaków
  
  return `CP_${hash}`;
}

/**
 * Utwórz Canonical Product z nazwy produktu
 */
function createCanonicalProduct(productName, ean = null, category = null) {
  const parsed = parseProductName(productName, ean);
  
  const canonicalId = createCanonicalProductId(
    parsed.brand,
    parsed.model,
    parsed.variant,
    parsed.color,
    parsed.ean
  );
  
  return {
    canonicalId,
    brand: parsed.brand,
    model: parsed.model,
    variant: parsed.variant,
    color: parsed.color,
    ean: parsed.ean,
    category: category,
    raw: parsed.raw,
    normalized: normalizeText(parsed.raw),
    createdAt: new Date().toISOString()
  };
}

/**
 * Sprawdź czy oferta pasuje do kanonicznego produktu
 */
function matchToCanonical(offer, canonicalProduct) {
  if (!offer || !canonicalProduct) {
    return {
      match: false,
      score: 0,
      tier: null,
      reason: 'Missing offer or canonical product'
    };
  }
  
  const offerName = offer.title || offer.name || '';
  const offerEan = offer.ean || null;
  
  // Parse offer
  const offerParsed = parseProductName(offerName, offerEan);
  
  // TIER 1 (100%) - EAN MATCH
  if (offerParsed.ean && canonicalProduct.ean && offerParsed.ean === canonicalProduct.ean) {
    return {
      match: true,
      score: 100,
      tier: 1,
      reason: 'EAN match'
    };
  }
  
  // TIER 2 (95%) - EXACT SPEC MATCH
  const brandMatch = offerParsed.brand === canonicalProduct.brand;
  const modelMatch = offerParsed.model === canonicalProduct.model;
  const variantMatch = !canonicalProduct.variant || offerParsed.variant === canonicalProduct.variant;
  const colorMatch = !canonicalProduct.color || offerParsed.color === canonicalProduct.color;
  
  if (brandMatch && modelMatch && variantMatch && colorMatch) {
    return {
      match: true,
      score: 95,
      tier: 2,
      reason: 'Exact spec match'
    };
  }
  
  // TIER 3 (85%) - FUZZY MATCH
  if (brandMatch && modelMatch) {
    // Brand + model match, ale variant/color może się różnić
    let fuzzyScore = 85;
    
    if (variantMatch) fuzzyScore += 5;
    if (colorMatch) fuzzyScore += 5;
    
    return {
      match: true,
      score: fuzzyScore,
      tier: 3,
      reason: 'Fuzzy match (brand + model)'
    };
  }
  
  // PONIŻEJ = OUT
  return {
    match: false,
    score: 0,
    tier: null,
    reason: 'No match'
  };
}

/**
 * Filtruj oferty według match tier
 */
function filterOffersByTier(offers, canonicalProduct, minTier = 2) {
  if (!offers || !Array.isArray(offers)) return [];
  
  const matched = offers.map(offer => {
    const matchResult = matchToCanonical(offer, canonicalProduct);
    return {
      ...offer,
      _canonical: {
        canonicalId: canonicalProduct.canonicalId,
        matchScore: matchResult.score,
        matchTier: matchResult.tier,
        matchReason: matchResult.reason,
        isMatch: matchResult.match
      }
    };
  });
  
  // Filtruj tylko tier >= minTier
  const filtered = matched.filter(offer => {
    const tier = offer._canonical.matchTier;
    return tier !== null && tier <= minTier;
  });
  
  return filtered;
}

/**
 * Pobierz statystyki matchowania
 */
function getMatchStats(offers, canonicalProduct) {
  if (!offers || !Array.isArray(offers)) {
    return {
      total: 0,
      tier1: 0,
      tier2: 0,
      tier3: 0,
      noMatch: 0
    };
  }
  
  const stats = {
    total: offers.length,
    tier1: 0,
    tier2: 0,
    tier3: 0,
    noMatch: 0
  };
  
  offers.forEach(offer => {
    const matchResult = matchToCanonical(offer, canonicalProduct);
    
    if (matchResult.tier === 1) stats.tier1++;
    else if (matchResult.tier === 2) stats.tier2++;
    else if (matchResult.tier === 3) stats.tier3++;
    else stats.noMatch++;
  });
  
  return stats;
}

module.exports = {
  normalizeText,
  extractBrand,
  extractModel,
  extractVariant,
  extractColor,
  parseProductName,
  createCanonicalProductId,
  createCanonicalProduct,
  matchToCanonical,
  filterOffersByTier,
  getMatchStats
};
