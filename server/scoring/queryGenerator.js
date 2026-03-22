"use strict";

/**
 * LONG-TAIL QUERY GENERATOR
 * 
 * Generuje 20-50 wariantów zapytania dla produktu
 * Każde zapytanie = inne sklepy = więcej ofert!
 * 
 * Zamiast 1 zapytania (8-10 sklepów) → 20 zapytań (200-500 sklepów)
 */

const NL_MODIFIERS = [
  'goedkoop',
  'aanbieding',
  'sale',
  'korting',
  'actie',
  'outlet',
  'deal',
  'prijs',
  'beste prijs',
  'laagste prijs',
  'vergelijken',
  'alternatief',
  'webshop',
  'online kopen',
  'bestellen',
  'Nederland',
  'NL',
  'zonder abonnement',
  'los toestel',
  'sim free',
  'unlocked'
];

const QUALITY_MODIFIERS = [
  'nieuw',
  'origineel',
  'officieel',
  'garantie',
  'fabrieksgarantie',
  'Nederlands',
  'NL versie'
];

const SHOP_TYPES = [
  'webshop',
  'online winkel',
  'internetwinkel',
  'shop',
  'store'
];

/**
 * Generuje warianty zapytania dla produktu
 * 
 * @param {string} productName - Nazwa produktu (np. "iPhone 15 Pro")
 * @param {Object} options - Opcje generowania
 * @returns {string[]} Array wariantów zapytania
 */
function generateQueryVariants(productName, options = {}) {
  if (!productName || typeof productName !== 'string') {
    return [];
  }
  
  const maxVariants = options.maxVariants || 30;
  const includeQuality = options.includeQuality !== false;
  
  const base = productName.trim();
  const variants = new Set();
  
  // 1. Base query
  variants.add(base);
  
  // 2. Base + NL modifiers
  NL_MODIFIERS.forEach(mod => {
    variants.add(`${base} ${mod}`);
    variants.add(`${mod} ${base}`);
  });
  
  // 3. Base + quality modifiers (jeśli enabled)
  if (includeQuality) {
    QUALITY_MODIFIERS.forEach(mod => {
      variants.add(`${base} ${mod}`);
    });
  }
  
  // 4. Base + shop types
  SHOP_TYPES.forEach(shop => {
    variants.add(`${base} ${shop}`);
    variants.add(`${base} ${shop} Nederland`);
  });
  
  // 5. Kombinacje (top modifiers only)
  const topModifiers = ['goedkoop', 'aanbieding', 'sale', 'beste prijs'];
  topModifiers.forEach(mod1 => {
    topModifiers.forEach(mod2 => {
      if (mod1 !== mod2) {
        variants.add(`${base} ${mod1} ${mod2}`);
      }
    });
  });
  
  // 6. Long-tail specific
  variants.add(`${base} waar kopen`);
  variants.add(`${base} beste deal`);
  variants.add(`${base} goedkoopste`);
  variants.add(`${base} prijs vergelijken Nederland`);
  variants.add(`${base} online bestellen goedkoop`);
  
  // Convert Set to Array i ogranicz do maxVariants
  const result = Array.from(variants).slice(0, maxVariants);
  
  return result;
}

/**
 * Generuje zapytania dla EAN (prostsze, bo EAN jest unikalny)
 */
function generateEANQueries(ean, options = {}) {
  if (!ean) return [];
  
  const maxVariants = options.maxVariants || 15;
  const eanStr = String(ean).trim();
  
  const variants = new Set();
  
  // 1. Base EAN
  variants.add(eanStr);
  
  // 2. EAN + modifiers
  const topModifiers = [
    'goedkoop',
    'aanbieding',
    'beste prijs',
    'vergelijken',
    'Nederland'
  ];
  
  topModifiers.forEach(mod => {
    variants.add(`${eanStr} ${mod}`);
  });
  
  // 3. EAN + shop types
  variants.add(`${eanStr} webshop`);
  variants.add(`${eanStr} online kopen`);
  
  return Array.from(variants).slice(0, maxVariants);
}

/**
 * Generuje zapytania dla produktu (auto-detect EAN vs name)
 */
function generateQueries(product, options = {}) {
  if (!product) return [];
  
  const productStr = String(product).trim();
  
  // Detect EAN (tylko cyfry, 8-13 znaków)
  const isEAN = /^\d{8,13}$/.test(productStr);
  
  if (isEAN) {
    return generateEANQueries(productStr, options);
  } else {
    return generateQueryVariants(productStr, options);
  }
}

module.exports = {
  generateQueries,
  generateQueryVariants,
  generateEANQueries
};
