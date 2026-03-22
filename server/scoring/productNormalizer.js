"use strict";

/**
 * PRODUCT NORMALIZER
 * 
 * Chaos → Porządek
 * "iPhone 15 128GB zwart" → cluster_id: "iphone15_128"
 * "Apple iPhone 15 black 128" → cluster_id: "iphone15_128"
 */

const BRANDS = [
  'apple', 'samsung', 'sony', 'lg', 'philips', 'panasonic',
  'bosch', 'siemens', 'aeg', 'whirlpool', 'miele', 'dyson',
  'dell', 'hp', 'lenovo', 'asus', 'acer', 'microsoft',
  'nintendo', 'playstation', 'xbox', 'logitech', 'razer',
  'bose', 'jbl', 'beats', 'sennheiser', 'canon', 'nikon'
];

const COLOR_MAPPINGS = {
  'zwart': 'black',
  'wit': 'white',
  'grijs': 'gray',
  'zilver': 'silver',
  'goud': 'gold',
  'roze': 'pink',
  'rood': 'red',
  'blauw': 'blue',
  'groen': 'green',
  'paars': 'purple',
  'geel': 'yellow',
  'oranje': 'orange'
};

const STORAGE_UNITS = ['gb', 'tb', 'mb'];

/**
 * Ekstraktuje brand z tytułu
 */
function extractBrand(title) {
  if (!title || typeof title !== 'string') return null;
  
  const lower = title.toLowerCase();
  
  for (const brand of BRANDS) {
    if (lower.includes(brand)) {
      return brand;
    }
  }
  
  return null;
}

/**
 * Ekstraktuje model z tytułu (heurystyka)
 */
function extractModel(title) {
  if (!title || typeof title !== 'string') return null;
  
  const lower = title.toLowerCase();
  
  // iPhone patterns
  const iphoneMatch = lower.match(/iphone\s*(\d+)\s*(pro|plus|mini|max)?/i);
  if (iphoneMatch) {
    const num = iphoneMatch[1];
    const variant = iphoneMatch[2] || '';
    return `iphone${num}${variant}`.toLowerCase();
  }
  
  // Samsung Galaxy patterns
  const galaxyMatch = lower.match(/galaxy\s*([a-z]\d+)/i);
  if (galaxyMatch) {
    return `galaxy${galaxyMatch[1]}`.toLowerCase();
  }
  
  // PlayStation patterns
  const psMatch = lower.match(/playstation\s*(\d+)/i);
  if (psMatch) {
    return `ps${psMatch[1]}`;
  }
  
  // Xbox patterns
  const xboxMatch = lower.match(/xbox\s*(series\s*[xs]|one)/i);
  if (xboxMatch) {
    return `xbox${xboxMatch[1].replace(/\s+/g, '')}`.toLowerCase();
  }
  
  // Generic: first word after brand
  const brand = extractBrand(title);
  if (brand) {
    const afterBrand = lower.split(brand)[1];
    if (afterBrand) {
      const words = afterBrand.trim().split(/\s+/);
      if (words.length > 0) {
        return words[0].replace(/[^\w]/g, '');
      }
    }
  }
  
  return null;
}

/**
 * Ekstraktuje storage (128GB, 1TB, etc)
 */
function extractStorage(title) {
  if (!title || typeof title !== 'string') return null;
  
  const lower = title.toLowerCase();
  
  // Pattern: number + unit (128gb, 1tb, etc)
  for (const unit of STORAGE_UNITS) {
    const pattern = new RegExp(`(\\d+)\\s*${unit}`, 'i');
    const match = lower.match(pattern);
    if (match) {
      return `${match[1]}${unit}`;
    }
  }
  
  return null;
}

/**
 * Ekstraktuje kolor (normalizuje NL → EN)
 */
function extractColor(title) {
  if (!title || typeof title !== 'string') return null;
  
  const lower = title.toLowerCase();
  
  // Check NL colors
  for (const [nl, en] of Object.entries(COLOR_MAPPINGS)) {
    if (lower.includes(nl)) {
      return en;
    }
  }
  
  // Check EN colors
  for (const en of Object.values(COLOR_MAPPINGS)) {
    if (lower.includes(en)) {
      return en;
    }
  }
  
  return null;
}

/**
 * Generuje cluster_id dla produktu
 * 
 * cluster_id = unikalny identyfikator dla tego samego produktu
 * Różne tytuły → ten sam cluster_id
 */
function generateClusterId(title) {
  if (!title || typeof title !== 'string') return null;
  
  const brand = extractBrand(title);
  const model = extractModel(title);
  const storage = extractStorage(title);
  
  if (!brand && !model) return null;
  
  const parts = [];
  if (brand) parts.push(brand);
  if (model) parts.push(model);
  if (storage) parts.push(storage);
  
  return parts.join('_');
}

/**
 * Normalizuje produkt
 * 
 * @param {Object} offer - Oferta z title
 * @returns {Object} Znormalizowany produkt
 */
function normalizeProduct(offer) {
  if (!offer || typeof offer !== 'object') return offer;
  
  const title = offer.title || '';
  
  return {
    ...offer,
    _normalized: {
      cluster_id: generateClusterId(title),
      brand: extractBrand(title),
      model: extractModel(title),
      storage: extractStorage(title),
      color: extractColor(title)
    }
  };
}

/**
 * Grupuje oferty po cluster_id
 */
function groupByCluster(offers) {
  if (!Array.isArray(offers)) return {};
  
  const groups = {};
  
  offers.forEach(offer => {
    const normalized = normalizeProduct(offer);
    const clusterId = normalized._normalized?.cluster_id || 'unknown';
    
    if (!groups[clusterId]) {
      groups[clusterId] = [];
    }
    
    groups[clusterId].push(normalized);
  });
  
  return groups;
}

module.exports = {
  normalizeProduct,
  generateClusterId,
  extractBrand,
  extractModel,
  extractStorage,
  extractColor,
  groupByCluster
};
