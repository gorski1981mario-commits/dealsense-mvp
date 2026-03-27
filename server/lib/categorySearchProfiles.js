"use strict";

/**
 * CATEGORY SEARCH PROFILES
 * 
 * Każda kategoria ma INNE zasady wyszukiwania!
 * - Elektronika: EAN FIRST (1:1 identyfikacja)
 * - Moda: FUZZY + BRAND HEAVY (więcej wariantów)
 * - Dom i ogród: MID STRICT (brand opcjonalny)
 * - Zdrowie i fitness: STRICT + TRUST FILTER
 * - Auto i akcesoria: VIN/MODEL MATCH
 * - Zabawki i edukacja: CATEGORY + AGE MATCH
 * - Narzędzia DIY: POWER/SPEC HEAVY
 * 
 * SKIP:
 * - Meble (IKEA = unikalne, nie porównujemy)
 * - Zwierzęta (nie porównujemy kto za ile kupuje kota)
 */

const CATEGORY_PROFILES = {
  // 1. ELEKTRONIKA - MAX STRICT (EAN = 1:1)
  electronics: {
    name: 'Elektronika',
    priority: 'EAN_FIRST',
    strictness: 'MAX_STRICT',
    searchStrategy: {
      eanWeight: 100, // EAN ma 100% wagę
      brandWeight: 80,
      modelWeight: 90,
      specWeight: 85,
      fuzzyMatch: false, // Zero fuzzy!
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [model] [specs] [ean]',
      fallback: '[brand] [model] [specs]',
      maxVariants: 3 // Mało wariantów
    },
    filters: {
      bannedKeywords: ['refurbished', 'renewed', 'used', 'tweedehands', 'occasion', 'case', 'cover', 'adapter', 'accessory', 'bundle', 'set'],
      minSimilarity: 90, // Bardzo wysoka zgodność
      trustMinimum: 50,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 10,
      avg: 35,
      max: 70
    },
    examples: ['iPhone 15 Pro', 'MacBook Pro M3', 'Samsung Galaxy S24', 'AirPods Pro 2']
  },

  // 2. MODA - FUZZY + BRAND HEAVY
  fashion: {
    name: 'Moda',
    priority: 'BRAND_FIRST',
    strictness: 'FUZZY',
    searchStrategy: {
      eanWeight: 30, // EAN rzadko działa w modzie
      brandWeight: 100, // Brand BARDZO ważny
      modelWeight: 70,
      specWeight: 60, // Rozmiar, kolor
      fuzzyMatch: true, // Fuzzy matching!
      exactMatch: false
    },
    queryBuilder: {
      primary: '[brand] [model] [size] [color] NL',
      fallback: '[brand] [model] [category]',
      maxVariants: 10 // Więcej wariantów (różne rozmiary, kolory)
    },
    filters: {
      bannedKeywords: ['replica', 'fake', 'imitation', 'namaak'],
      minSimilarity: 75, // Niższa zgodność (fuzzy)
      trustMinimum: 50,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 15,
      avg: 25,
      max: 40
    },
    examples: ['Nike Air Max 90', 'Adidas Ultraboost', 'Levi\'s 501 jeans', 'The North Face jacket']
  },

  // 3. DOM I OGRÓD - MID STRICT
  home_garden: {
    name: 'Dom i ogród',
    priority: 'SPEC_FIRST',
    strictness: 'MID_STRICT',
    searchStrategy: {
      eanWeight: 60,
      brandWeight: 50, // Brand opcjonalny
      modelWeight: 70,
      specWeight: 90, // Parametry fizyczne ważne (rozmiar, moc)
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [model] [specs] [power] NL prijs',
      fallback: '[category] [specs] [power]',
      maxVariants: 5
    },
    filters: {
      bannedKeywords: ['refurbished', 'used', 'onderdelen', 'parts'],
      minSimilarity: 80,
      trustMinimum: 50,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 20,
      avg: 30,
      max: 45
    },
    examples: ['Karcher K5 pressure washer', 'Philips Airfryer XXL', 'Dyson V15 Detect']
  },

  // 4. ZDROWIE I FITNESS - STRICT + TRUST FILTER
  health_fitness: {
    name: 'Zdrowie i fitness',
    priority: 'TRUST_FIRST',
    strictness: 'STRICT',
    searchStrategy: {
      eanWeight: 80,
      brandWeight: 90, // Brand ważny (zdrowie!)
      modelWeight: 80,
      specWeight: 70,
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [model] [specs] best price NL',
      fallback: '[brand] [model] NL',
      maxVariants: 3
    },
    filters: {
      bannedKeywords: ['fake', 'replica', 'namaak', 'imitation'],
      minSimilarity: 85,
      trustMinimum: 60, // Wyższy trust (zdrowie!)
      allowSuspicious: false,
      trustedMerchantsOnly: true // TYLKO zaufane sklepy
    },
    expectedSavings: {
      min: 10,
      avg: 20,
      max: 30
    },
    examples: ['Oral-B iO Series 9', 'Garmin Forerunner 255', 'Whey protein isolate 2kg']
  },

  // 5. AUTO I AKCESORIA - VIN/MODEL MATCH
  automotive: {
    name: 'Auto i akcesoria',
    priority: 'MODEL_FIRST',
    strictness: 'VIN_MATCH',
    searchStrategy: {
      eanWeight: 70,
      brandWeight: 90,
      modelWeight: 100, // Model BARDZO ważny (VIN/model auta)
      specWeight: 85,
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [car_model] [part] [year] front best price',
      fallback: '[brand] [part] [car_model]',
      maxVariants: 5
    },
    filters: {
      bannedKeywords: ['used', 'tweedehands', 'occasion', 'salvage'],
      minSimilarity: 85,
      trustMinimum: 55,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 25,
      avg: 45,
      max: 70
    },
    examples: ['BMW 3 series F30 brake pads', 'Bosch Aerotwin ruitenwissers', 'Michelin Pilot Sport 4']
  },

  // 6. ZABAWKI I EDUKACJA - CATEGORY + AGE MATCH
  toys_education: {
    name: 'Zabawki i edukacja',
    priority: 'AGE_FIRST',
    strictness: 'CATEGORY_MATCH',
    searchStrategy: {
      eanWeight: 75,
      brandWeight: 80,
      modelWeight: 70,
      specWeight: 60, // Wiek, zestaw pełny vs części
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [model] [age] cheapest NL',
      fallback: '[brand] [model] [category]',
      maxVariants: 4
    },
    filters: {
      bannedKeywords: ['incomplete', 'parts only', 'onderdelen', 'zonder'],
      minSimilarity: 80,
      trustMinimum: 50,
      allowSuspicious: false,
      completeSetOnly: true // Tylko pełne zestawy
    },
    expectedSavings: {
      min: 15,
      avg: 25,
      max: 35
    },
    examples: ['LEGO Technic 8+ cheapest', 'Ravensburger puzzle 1000 pieces']
  },

  // 7. NARZĘDZIA DIY - POWER/SPEC HEAVY
  tools_diy: {
    name: 'Narzędzia DIY',
    priority: 'SPEC_FIRST',
    strictness: 'POWER_MATCH',
    searchStrategy: {
      eanWeight: 70,
      brandWeight: 85,
      modelWeight: 80,
      specWeight: 95, // Voltage, torque, model series
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [model] [voltage] [torque] best price NL',
      fallback: '[brand] [model] [voltage]',
      maxVariants: 4
    },
    filters: {
      bannedKeywords: ['refurbished', 'used', 'tweedehands', 'body only', 'zonder accu'],
      minSimilarity: 85,
      trustMinimum: 50,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 15,
      avg: 25,
      max: 40
    },
    examples: ['Bosch GSR 18V-55 brushless', 'Makita DHP484 18V', 'DeWalt DCD796']
  },

  // 8. KSIĄŻKI - STRICT (ISBN/tytuł)
  books: {
    name: 'Książki',
    priority: 'ISBN_FIRST',
    strictness: 'STRICT',
    searchStrategy: {
      eanWeight: 95, // ISBN = EAN
      brandWeight: 60, // Wydawca
      modelWeight: 90, // Tytuł
      specWeight: 50,
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[title] [author] [isbn] best price NL',
      fallback: '[title] [author]',
      maxVariants: 3
    },
    filters: {
      bannedKeywords: ['ebook', 'digital', 'pdf', 'kindle'],
      minSimilarity: 85,
      trustMinimum: 50,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 15,
      avg: 35,
      max: 55
    },
    examples: ['Harry Potter Complete Collection', 'Sapiens Yuval Noah Harari']
  },

  // 9. ROWERY - SPEC HEAVY (frame size, motor)
  bikes: {
    name: 'Rowery',
    priority: 'SPEC_FIRST',
    strictness: 'MID_STRICT',
    searchStrategy: {
      eanWeight: 60,
      brandWeight: 90,
      modelWeight: 85,
      specWeight: 95, // Frame size, motor, battery
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [model] [frame_size] [motor] NL',
      fallback: '[brand] [model] [type]',
      maxVariants: 5
    },
    filters: {
      bannedKeywords: ['used', 'tweedehands', 'occasion', 'frame only', 'zonder accu'],
      minSimilarity: 80,
      trustMinimum: 50,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 10,
      avg: 20,
      max: 40
    },
    examples: ['Gazelle Orange C7 HMB', 'VanMoof S3', 'Batavus e-bike']
  },

  // 10. DZIECKO/BABY - STRICT (bezpieczeństwo!)
  baby: {
    name: 'Dziecko i baby',
    priority: 'TRUST_FIRST',
    strictness: 'STRICT',
    searchStrategy: {
      eanWeight: 85,
      brandWeight: 95, // Brand BARDZO ważny (bezpieczeństwo)
      modelWeight: 85,
      specWeight: 70,
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [model] [year] best price NL',
      fallback: '[brand] [model]',
      maxVariants: 3
    },
    filters: {
      bannedKeywords: ['used', 'tweedehands', 'occasion', 'damaged'],
      minSimilarity: 85,
      trustMinimum: 60, // Wyższy trust (bezpieczeństwo dzieci!)
      allowSuspicious: false,
      trustedMerchantsOnly: true
    },
    expectedSavings: {
      min: 10,
      avg: 20,
      max: 30
    },
    examples: ['Bugaboo Fox 5', 'Maxi-Cosi Pebble 360', 'Nuna MIXX Next']
  },

  // 11. AGD KUCHENNE - MID STRICT
  kitchen_appliances: {
    name: 'AGD kuchenne',
    priority: 'SPEC_FIRST',
    strictness: 'MID_STRICT',
    searchStrategy: {
      eanWeight: 75,
      brandWeight: 80,
      modelWeight: 85,
      specWeight: 90, // Moc, pojemność
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [model] [capacity] [power] NL',
      fallback: '[brand] [model]',
      maxVariants: 4
    },
    filters: {
      bannedKeywords: ['refurbished', 'used', 'tweedehands', 'onderdelen'],
      minSimilarity: 80,
      trustMinimum: 50,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 15,
      avg: 25,
      max: 45
    },
    examples: ['KitchenAid Artisan', 'Nespresso Vertuo', 'Philips Airfryer XXL']
  },

  // 12. KOSMETYKI - BRAND HEAVY
  cosmetics: {
    name: 'Kosmetyki',
    priority: 'BRAND_FIRST',
    strictness: 'STRICT',
    searchStrategy: {
      eanWeight: 80,
      brandWeight: 95, // Brand BARDZO ważny
      modelWeight: 85,
      specWeight: 60,
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [product] [size] best price NL',
      fallback: '[brand] [product]',
      maxVariants: 3
    },
    filters: {
      bannedKeywords: ['fake', 'replica', 'namaak', 'tester', 'sample'],
      minSimilarity: 85,
      trustMinimum: 55,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 10,
      avg: 25,
      max: 35
    },
    examples: ['Estee Lauder Advanced Night Repair', 'Chanel No 5', 'La Mer Creme']
  },

  // 13. BIURO - STRICT (drukarki, monitory)
  office: {
    name: 'Biuro',
    priority: 'SPEC_FIRST',
    strictness: 'STRICT',
    searchStrategy: {
      eanWeight: 85,
      brandWeight: 80,
      modelWeight: 90,
      specWeight: 85,
      fuzzyMatch: false,
      exactMatch: true
    },
    queryBuilder: {
      primary: '[brand] [model] [specs] best price NL',
      fallback: '[brand] [model]',
      maxVariants: 3
    },
    filters: {
      bannedKeywords: ['refurbished', 'used', 'tweedehands', 'cartridge', 'toner'],
      minSimilarity: 85,
      trustMinimum: 50,
      allowSuspicious: false
    },
    expectedSavings: {
      min: 15,
      avg: 30,
      max: 50
    },
    examples: ['HP OfficeJet Pro 9010', 'Canon Pixma', 'Dell UltraSharp monitor']
  }
};

/**
 * Pobierz profil kategorii
 */
function getCategoryProfile(category) {
  const normalized = String(category || '').toLowerCase().trim();
  
  // Mapowanie aliasów
  const aliases = {
    'elektronika': 'electronics',
    'electronics': 'electronics',
    'tech': 'electronics',
    'gadgets': 'electronics',
    
    'moda': 'fashion',
    'fashion': 'fashion',
    'clothing': 'fashion',
    'shoes': 'fashion',
    'buty': 'fashion',
    
    'dom': 'home_garden',
    'home': 'home_garden',
    'garden': 'home_garden',
    'ogród': 'home_garden',
    
    'zdrowie': 'health_fitness',
    'health': 'health_fitness',
    'fitness': 'health_fitness',
    'sport': 'health_fitness',
    
    'auto': 'automotive',
    'car': 'automotive',
    'automotive': 'automotive',
    
    'zabawki': 'toys_education',
    'toys': 'toys_education',
    'education': 'toys_education',
    'edukacja': 'toys_education',
    
    'narzędzia': 'tools_diy',
    'tools': 'tools_diy',
    'diy': 'tools_diy'
  };
  
  const profileKey = aliases[normalized];
  
  if (!profileKey || !CATEGORY_PROFILES[profileKey]) {
    // Default: electronics (najbardziej strict)
    return CATEGORY_PROFILES.electronics;
  }
  
  return CATEGORY_PROFILES[profileKey];
}

/**
 * Sprawdź czy kategoria jest wspierana
 */
function isCategorySupported(category) {
  const normalized = String(category || '').toLowerCase().trim();
  
  // SKIP categories
  const skipCategories = [
    'meble', 'furniture', 'ikea', // IKEA = unikalne produkty
    'zwierzęta', 'pets', 'animals' // Nie porównujemy kto za ile kupuje kota
  ];
  
  return !skipCategories.includes(normalized);
}

/**
 * Pobierz wszystkie wspierane kategorie
 */
function getSupportedCategories() {
  return Object.keys(CATEGORY_PROFILES).map(key => ({
    key,
    name: CATEGORY_PROFILES[key].name,
    strictness: CATEGORY_PROFILES[key].strictness,
    expectedSavings: CATEGORY_PROFILES[key].expectedSavings
  }));
}

module.exports = {
  CATEGORY_PROFILES,
  getCategoryProfile,
  isCategorySupported,
  getSupportedCategories
};
