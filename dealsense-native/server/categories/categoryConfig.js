/**
 * Category-specific configuration
 * Każda kategoria ma swoje własne filtry, thresholds, weights
 */

const CATEGORIES = {
  ELECTRONICS: {
    name: 'Elektronika',
    enabled: true,
    // Filtry specyficzne dla elektroniki
    filters: {
      minPriceRatio: 0.3, // 30% base price
      maxPriceRatio: 1.0, // 100% base price (tylko tańsze)
      requireBrandNew: true, // Tylko nowe
      requireWarranty: true, // Wymaga gwarancji
      blockedKeywords: [
        'used', 'second hand', 'refurbished', 'pre-owned', 'renewed',
        'gebruikt', 'tweedehands', '2e hands', 'gereviseerd', 'gerenoveerd'
      ]
    },
    // Thresholds dla Deal Score
    thresholds: {
      minTrustScore: 50,
      minReviewCount: 10,
      minReviewScore: 4.0
    },
    // Weights dla Deal Score
    weights: {
      price: 0.4,
      quality: 0.3,
      trust: 0.2,
      freshness: 0.1
    },
    // Cache TTL
    cacheTTL: 6 * 60 * 60 * 1000 // 6 godzin
  },

  FASHION: {
    name: 'Mody',
    enabled: true,
    filters: {
      minPriceRatio: 0.3,
      maxPriceRatio: 1.0,
      requireBrandNew: true,
      blockedKeywords: [
        'used', 'second hand', 'vintage',
        'gebruikt', 'tweedehands', 'occasion'
      ]
    },
    thresholds: {
      minTrustScore: 40,
      minReviewCount: 5,
      minReviewScore: 3.5
    },
    weights: {
      price: 0.5,
      quality: 0.2,
      trust: 0.2,
      freshness: 0.1
    },
    cacheTTL: 3 * 60 * 60 * 1000 // 3 godziny (szybciej zmieniają się)
  },

  HOME: {
    name: 'Dom',
    enabled: true,
    filters: {
      minPriceRatio: 0.3,
      maxPriceRatio: 1.0,
      requireBrandNew: true,
      blockedKeywords: [
        'used', 'second hand', 'damaged',
        'gebruikt', 'beschadigd', 'beschadigde'
      ]
    },
    thresholds: {
      minTrustScore: 45,
      minReviewCount: 8,
      minReviewScore: 4.0
    },
    weights: {
      price: 0.4,
      quality: 0.3,
      trust: 0.2,
      freshness: 0.1
    },
    cacheTTL: 12 * 60 * 60 * 1000 // 12 godzin
  },

  SPORTS: {
    name: 'Sport',
    enabled: true,
    filters: {
      minPriceRatio: 0.3,
      maxPriceRatio: 1.0,
      requireBrandNew: true,
      blockedKeywords: [
        'used', 'second hand', 'worn',
        'gebruikt', 'tweedehands', 'versleten'
      ]
    },
    thresholds: {
      minTrustScore: 40,
      minReviewCount: 5,
      minReviewScore: 3.5
    },
    weights: {
      price: 0.5,
      quality: 0.2,
      trust: 0.2,
      freshness: 0.1
    },
    cacheTTL: 6 * 60 * 60 * 1000 // 6 godzin
  },

  BOOKS: {
    name: 'Książki',
    enabled: true,
    filters: {
      minPriceRatio: 0.5, // Książki mogą być dużo tańsze
      maxPriceRatio: 1.0,
      requireBrandNew: true,
      blockedKeywords: [
        'used', 'second hand', 'worn',
        'gebruikt', 'tweedehands', 'beschadigd'
      ]
    },
    thresholds: {
      minTrustScore: 35, // Niższy trust dla książek
      minReviewCount: 3,
      minReviewScore: 3.0
    },
    weights: {
      price: 0.6,
      quality: 0.1,
      trust: 0.2,
      freshness: 0.1
    },
    cacheTTL: 24 * 60 * 60 * 1000 // 24 godziny (książki się rzadziej zmieniają)
  },

  BEAUTY: {
    name: 'Kosmetyki',
    enabled: true,
    filters: {
      minPriceRatio: 0.4,
      maxPriceRatio: 1.0,
      requireBrandNew: true,
      blockedKeywords: [
        'used', 'opened', 'tester',
        'gebruikt', 'geopend', 'tester'
      ]
    },
    thresholds: {
      minTrustScore: 45,
      minReviewCount: 10,
      minReviewScore: 4.0
    },
    weights: {
      price: 0.4,
      quality: 0.3,
      trust: 0.2,
      freshness: 0.1
    },
    cacheTTL: 6 * 60 * 60 * 1000 // 6 godzin
  },

  TOOLS: {
    name: 'Narzędzia',
    enabled: true,
    filters: {
      minPriceRatio: 0.3,
      maxPriceRatio: 1.0,
      requireBrandNew: true,
      blockedKeywords: [
        'used', 'second hand', 'broken',
        'gebruikt', 'tweedehands', 'kapot'
      ]
    },
    thresholds: {
      minTrustScore: 45,
      minReviewCount: 8,
      minReviewScore: 4.0
    },
    weights: {
      price: 0.4,
      quality: 0.3,
      trust: 0.2,
      freshness: 0.1
    },
    cacheTTL: 12 * 60 * 60 * 1000 // 12 godzin
  }
};

// Kategoryzacja produktu po nazwie
function categorizeProduct(productName) {
  const name = productName.toLowerCase();

  // Narzędzia
  if (name.includes('tool') || name.includes('drill') || name.includes('saw') || 
      name.includes('hammer') || name.includes('wrench') || name.includes('screwdriver') ||
      name.includes('battery') || name.includes('cordless') || name.includes('elektrisch')) {
    return 'TOOLS';
  }

  // Elektronika (w tym Philips Sonicare)
  if (name.includes('iphone') || name.includes('samsung') || name.includes('macbook') ||
      name.includes('laptop') || name.includes('phone') || name.includes('tablet') ||
      name.includes('television') || name.includes('tv') || name.includes('monitor') ||
      name.includes('philips') || name.includes('sonicare') || name.includes('toothbrush')) {
    return 'ELECTRONICS';
  }

  // Mody (Zalando tylko w mody)
  if (name.includes('zalando')) {
    return 'FASHION';
  }

  if (name.includes('nike') || name.includes('adidas') || name.includes('shoes') ||
      name.includes('jacket') || name.includes('shirt') || name.includes('pants') ||
      name.includes('dress') || name.includes('bag')) {
    return 'FASHION';
  }

  // Dom
  if (name.includes('furniture') || name.includes('shelf') || name.includes('chair') ||
      name.includes('table') || name.includes('lamp') || name.includes('curtain')) {
    return 'HOME';
  }

  // Sport
  if (name.includes('yoga') || name.includes('fitness') || name.includes('gym') ||
      name.includes('running') || name.includes('football') || name.includes('bicycle')) {
    return 'SPORTS';
  }

  // Książki
  if (name.includes('book') || name.includes('harry potter') || name.includes('novel') ||
      name.includes('isbn') || name.includes('paperback')) {
    return 'BOOKS';
  }

  // Kosmetyki
  if (name.includes('cream') || name.includes('lotion') || name.includes('shampoo') ||
      name.includes('makeup') || name.includes('perfume') || name.includes('loreal') ||
      name.includes('notino') || name.includes('revitalift') || name.includes('parfum')) {
    return 'BEAUTY';
  }

  // Default - electronics
  return 'ELECTRONICS';
}

function getCategoryConfig(categoryKey) {
  return CATEGORIES[categoryKey] || CATEGORIES.ELECTRONICS;
}

module.exports = {
  CATEGORIES,
  categorizeProduct,
  getCategoryConfig
};
