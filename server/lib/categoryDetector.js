"use strict";

/**
 * CATEGORY DETECTOR
 * 
 * Automatyczna detekcja kategorii z inputu usera
 * Używa keyword matching + context analysis
 */

const CATEGORY_KEYWORDS = {
  electronics: {
    keywords: [
      // Devices
      'iphone', 'ipad', 'macbook', 'samsung', 'galaxy', 'pixel', 'oneplus',
      'laptop', 'computer', 'tablet', 'smartphone', 'telefoon', 'tv', 'television',
      'monitor', 'screen', 'display', 'beeldscherm',
      // Audio
      'airpods', 'headphones', 'earbuds', 'speaker', 'koptelefoon', 'luidspreker',
      'soundbar', 'bluetooth', 'wireless',
      // Gaming
      'playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'console', 'controller',
      // Cameras
      'camera', 'gopro', 'canon', 'nikon', 'sony', 'lens', 'fotocamera',
      // Smart home
      'alexa', 'google home', 'nest', 'philips hue', 'smart', 'iot'
    ],
    brands: ['apple', 'samsung', 'sony', 'lg', 'philips', 'bose', 'jbl', 'logitech', 'microsoft', 'dell', 'hp', 'asus', 'acer', 'lenovo']
  },
  
  fashion: {
    keywords: [
      // Clothing
      'shirt', 'jeans', 'jacket', 'coat', 'dress', 'pants', 'broek', 'jas', 'jurk',
      'sweater', 'hoodie', 'trui', 'vest',
      // Shoes
      'shoes', 'sneakers', 'boots', 'sandals', 'schoenen', 'laarzen',
      'nike', 'adidas', 'puma', 'reebok', 'vans', 'converse',
      // Accessories
      'bag', 'backpack', 'wallet', 'belt', 'tas', 'rugzak', 'riem',
      // Sizes
      'size', 'maat', 'small', 'medium', 'large', 'xl', 'xxl'
    ],
    brands: ['nike', 'adidas', 'puma', 'reebok', 'new balance', 'asics', 'under armour', 'levi\'s', 'tommy hilfiger', 'calvin klein', 'the north face', 'patagonia']
  },
  
  home_garden: {
    keywords: [
      // Appliances
      'vacuum', 'stofzuiger', 'dyson', 'airfryer', 'friteuse', 'blender', 'mixer',
      'coffee machine', 'koffiezetapparaat', 'espresso', 'nespresso',
      'washing machine', 'wasmachine', 'dryer', 'droger', 'dishwasher', 'vaatwasser',
      // Garden
      'lawn mower', 'grasmaaier', 'trimmer', 'hedge', 'pressure washer', 'hogedrukreiniger',
      'grill', 'bbq', 'barbecue',
      // Furniture (but not IKEA!)
      'chair', 'stoel', 'table', 'tafel', 'desk', 'bureau', 'sofa', 'bank', 'bed'
    ],
    brands: ['dyson', 'philips', 'karcher', 'bosch', 'siemens', 'miele', 'samsung', 'lg', 'whirlpool', 'delonghi', 'nespresso']
  },
  
  health_fitness: {
    keywords: [
      // Fitness equipment
      'treadmill', 'loopband', 'bike', 'fiets', 'dumbbell', 'halter', 'kettlebell',
      'yoga mat', 'yogamat', 'resistance band', 'weerstandsband',
      // Wearables
      'smartwatch', 'fitness tracker', 'garmin', 'fitbit', 'apple watch',
      'heart rate', 'hartslag', 'gps', 'running watch',
      // Health
      'toothbrush', 'tandenborstel', 'oral-b', 'sonicare', 'electric toothbrush',
      'blood pressure', 'bloeddruk', 'thermometer',
      // Supplements
      'protein', 'whey', 'creatine', 'vitamins', 'vitamines', 'omega'
    ],
    brands: ['garmin', 'polar', 'fitbit', 'apple', 'samsung', 'oral-b', 'philips sonicare', 'braun', 'optimum nutrition', 'myprotein']
  },
  
  automotive: {
    keywords: [
      // Parts
      'brake', 'rem', 'pads', 'blokken', 'disc', 'schijf',
      'tire', 'tyre', 'band', 'wheel', 'wiel',
      'filter', 'oil', 'olie', 'spark plug', 'bougie',
      'wiper', 'ruitenwisser', 'blade', 'battery', 'accu',
      // Car models
      'bmw', 'mercedes', 'audi', 'volkswagen', 'vw', 'ford', 'opel', 'peugeot', 'renault',
      'toyota', 'honda', 'mazda', 'nissan', 'hyundai', 'kia',
      // Accessories
      'dashcam', 'gps', 'navigation', 'navigatie', 'car seat', 'autostoel'
    ],
    brands: ['bosch', 'brembo', 'michelin', 'continental', 'bridgestone', 'goodyear', 'castrol', 'shell', 'mobil', 'mann-filter']
  },
  
  toys_education: {
    keywords: [
      // Toys
      'lego', 'playmobil', 'barbie', 'hot wheels', 'nerf', 'puzzle',
      'board game', 'bordspel', 'card game', 'kaartspel',
      'action figure', 'actiefiguur', 'doll', 'pop',
      // Education
      'book', 'boek', 'textbook', 'studieboek', 'calculator', 'rekenmachine',
      'pencil', 'potlood', 'pen', 'notebook', 'schrift',
      // Age indicators
      '3+', '5+', '8+', '12+', 'years', 'jaar', 'age', 'leeftijd'
    ],
    brands: ['lego', 'playmobil', 'mattel', 'hasbro', 'ravensburger', 'jumbo', 'fisher-price', 'vtech']
  },
  
  tools_diy: {
    keywords: [
      // Power tools
      'drill', 'boor', 'screwdriver', 'schroevendraaier', 'saw', 'zaag',
      'sander', 'schuurmachine', 'grinder', 'slijpmachine',
      'hammer drill', 'klopboormachine', 'impact driver', 'slagschroevendraaier',
      // Specs
      '18v', '20v', 'brushless', 'borstelloze', 'cordless', 'snoerloos',
      'battery', 'accu', 'charger', 'oplader',
      // Hand tools
      'wrench', 'sleutel', 'pliers', 'tang', 'hammer', 'hamer', 'level', 'waterpas'
    ],
    brands: ['bosch', 'makita', 'dewalt', 'milwaukee', 'metabo', 'hilti', 'festool', 'ryobi', 'black+decker', 'stanley']
  }
};

/**
 * Wykryj kategorię z inputu usera
 */
function detectCategory(productName, ean = null) {
  if (!productName || typeof productName !== 'string') {
    return 'electronics'; // Default
  }
  
  const input = productName.toLowerCase().trim();
  const scores = {};
  
  // Inicjalizuj scores
  Object.keys(CATEGORY_KEYWORDS).forEach(cat => {
    scores[cat] = 0;
  });
  
  // Keyword matching
  Object.keys(CATEGORY_KEYWORDS).forEach(category => {
    const data = CATEGORY_KEYWORDS[category];
    
    // Check keywords
    data.keywords.forEach(keyword => {
      if (input.includes(keyword.toLowerCase())) {
        scores[category] += 10;
      }
    });
    
    // Check brands (higher weight)
    if (data.brands) {
      data.brands.forEach(brand => {
        if (input.includes(brand.toLowerCase())) {
          scores[category] += 20;
        }
      });
    }
  });
  
  // EAN boost dla elektroniki
  if (ean && ean.length >= 8) {
    scores.electronics += 15;
  }
  
  // Znajdź kategorię z najwyższym score
  let maxScore = 0;
  let detectedCategory = 'electronics'; // Default
  
  Object.keys(scores).forEach(cat => {
    if (scores[cat] > maxScore) {
      maxScore = scores[cat];
      detectedCategory = cat;
    }
  });
  
  // Jeśli score < 10, użyj default (electronics)
  if (maxScore < 10) {
    return 'electronics';
  }
  
  return detectedCategory;
}

/**
 * Wykryj kategorię z confidence score
 */
function detectCategoryWithConfidence(productName, ean = null) {
  const category = detectCategory(productName, ean);
  const input = (productName || '').toLowerCase().trim();
  
  let confidence = 0;
  const data = CATEGORY_KEYWORDS[category];
  
  if (data) {
    // Policz ile keywords pasuje
    let matches = 0;
    data.keywords.forEach(keyword => {
      if (input.includes(keyword.toLowerCase())) {
        matches++;
      }
    });
    
    if (data.brands) {
      data.brands.forEach(brand => {
        if (input.includes(brand.toLowerCase())) {
          matches += 2; // Brand = 2x weight
        }
      });
    }
    
    // Confidence = % matches
    const totalKeywords = data.keywords.length + (data.brands ? data.brands.length : 0);
    confidence = Math.min(100, Math.round((matches / totalKeywords) * 100 * 5)); // *5 bo zazwyczaj pasuje 1-2 keywords
  }
  
  return {
    category,
    confidence,
    hasEan: !!ean
  };
}

module.exports = {
  detectCategory,
  detectCategoryWithConfidence,
  CATEGORY_KEYWORDS
};
