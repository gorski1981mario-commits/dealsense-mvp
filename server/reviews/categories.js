/**
 * CATEGORY SYSTEM - UNIWERSALNY
 * Dziś elektronika, jutro wszystko (50+ kategorii)
 */

/**
 * Główne kategorie - START
 */
const CATEGORIES = {
  // ELEKTRONIKA (start)
  electronics: {
    name: 'Elektronika',
    subcategories: ['tv', 'telefony', 'sluchawki', 'pralki', 'laptopy', 'tablety'],
    sources: ['bol', 'coolblue', 'mediamarkt', 'tweakers', 'reddit_nl', 'trustpilot'],
    aiPrompt: 'elektronika (TV, telefony, pralki, słuchawki)'
  },
  
  // DOM (przyszłość)
  home: {
    name: 'Dom & Meble',
    subcategories: ['meble', 'dekoracje', 'ogrod', 'narzedzia'],
    sources: ['bol', 'coolblue', 'reddit_nl', 'vivaforum', 'trustpilot'],
    aiPrompt: 'meble i wyposażenie domu'
  },
  
  // ZDROWIE (przyszłość)
  health: {
    name: 'Zdrowie & Uroda',
    subcategories: ['kosmetyki', 'suplementy', 'fitness', 'wellness'],
    sources: ['bol', 'reddit_nl', 'trustpilot', 'vivaforum'],
    aiPrompt: 'produkty zdrowotne i kosmetyczne'
  },
  
  // WAKACJE (przyszłość)
  travel: {
    name: 'Wakacje & Podróże',
    subcategories: ['hotele', 'loty', 'wycieczki', 'ubezpieczenia_podrozne'],
    sources: ['reddit_nl', 'trustpilot', 'tripadvisor', 'booking_reviews'],
    aiPrompt: 'usługi turystyczne i podróżnicze'
  },
  
  // UBEZPIECZENIA (przyszłość)
  insurance: {
    name: 'Ubezpieczenia',
    subcategories: ['auto', 'dom', 'zdrowie', 'zycie'],
    sources: ['reddit_nl', 'trustpilot', 'independer_reviews', 'polis_direct_reviews'],
    aiPrompt: 'usługi ubezpieczeniowe'
  },
  
  // AUTO (przyszłość)
  auto: {
    name: 'Motoryzacja',
    subcategories: ['samochody', 'motocykle', 'akcesoria', 'serwisy'],
    sources: ['reddit_nl', 'trustpilot', 'autotrack_nl', 'marktplaats_reviews'],
    aiPrompt: 'produkty i usługi motoryzacyjne'
  }
}

/**
 * Źródła per kategoria - SKALOWALNE
 */
const SOURCES_BY_CATEGORY = {
  electronics: {
    primary: ['bol', 'coolblue', 'mediamarkt'], // Zawsze
    secondary: ['tweakers', 'reddit_nl'],        // Jeśli primary < 20 reviews
    forums: ['vivaforum', 'tweakers_forum']      // Opcjonalnie
  },
  
  home: {
    primary: ['bol', 'ikea_reviews'],
    secondary: ['reddit_nl', 'vivaforum'],
    forums: ['woonboulevard_forum']
  },
  
  health: {
    primary: ['bol', 'holland_barrett_reviews'],
    secondary: ['reddit_nl', 'trustpilot'],
    forums: ['gezondheid_forum']
  },
  
  travel: {
    primary: ['trustpilot', 'tripadvisor'],
    secondary: ['reddit_nl', 'booking_reviews'],
    forums: ['reizen_forum']
  },
  
  insurance: {
    primary: ['trustpilot', 'independer_reviews'],
    secondary: ['reddit_nl', 'polis_direct_reviews'],
    forums: ['financieel_forum']
  },
  
  auto: {
    primary: ['trustpilot', 'autotrack_nl'],
    secondary: ['reddit_nl', 'marktplaats_reviews'],
    forums: ['auto_forum']
  }
}

/**
 * Detect category from identifier
 */
function detectCategory(identifier, hintCategory = null) {
  // If hint provided, use it
  if (hintCategory && CATEGORIES[hintCategory]) {
    return hintCategory
  }
  
  // Auto-detect from identifier
  const lower = identifier.toLowerCase()
  
  // Electronics keywords
  if (lower.match(/tv|televisie|telefoon|smartphone|iphone|samsung|pralka|wasmachine|sluchawki|headphone|laptop|tablet|camera/)) {
    return 'electronics'
  }
  
  // Home keywords
  if (lower.match(/meble|stol|krzeslo|sofa|lampa|ogrod|narzedzia|ikea/)) {
    return 'home'
  }
  
  // Health keywords
  if (lower.match(/kosmetyk|suplement|fitness|wellness|zdrowie|uroda/)) {
    return 'health'
  }
  
  // Travel keywords
  if (lower.match(/hotel|lot|wakacje|wycieczka|booking|ryanair|klm/)) {
    return 'travel'
  }
  
  // Insurance keywords
  if (lower.match(/ubezpieczenie|verzekering|insurance|polis|aegon|achmea/)) {
    return 'insurance'
  }
  
  // Auto keywords
  if (lower.match(/samochod|auto|motor|opel|volkswagen|toyota|bmw/)) {
    return 'auto'
  }
  
  // Default: electronics (start)
  return 'electronics'
}

/**
 * Get sources for category
 */
function getSourcesForCategory(category, options = {}) {
  const config = SOURCES_BY_CATEGORY[category] || SOURCES_BY_CATEGORY.electronics
  
  let sources = [...config.primary]
  
  // Add secondary if requested or if we need more
  if (options.includeSecondary || options.minReviews > 50) {
    sources = [...sources, ...config.secondary]
  }
  
  // Add forums if requested
  if (options.includeForums) {
    sources = [...sources, ...config.forums]
  }
  
  return sources
}

/**
 * Get AI prompt for category
 */
function getAIPromptForCategory(category) {
  const config = CATEGORIES[category] || CATEGORIES.electronics
  return config.aiPrompt
}

module.exports = {
  CATEGORIES,
  SOURCES_BY_CATEGORY,
  detectCategory,
  getSourcesForCategory,
  getAIPromptForCategory
}
