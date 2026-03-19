// Search Wrapper for DealSense Crawler
// Converts product name/EAN search into crawl jobs for multiple domains

const directScraper = require('./direct-scraper');
const domains = require('./domains-1000-nl-final');
const smartTargeting = require('./smart-targeting');
const RotationSystem = require('./rotation-system');

/**
 * Search for product across multiple NL domains using crawler
 * @param {Object} options - Search options
 * @param {string} options.query - Product name or search query
 * @param {string} options.ean - EAN code (optional)
 * @param {number} options.maxDomains - Max domains to crawl (default: 30)
 * @param {string} options.category - Product category (default: 'products')
 * @returns {Promise<Array>} - Array of offers from all domains
 */
async function searchProduct({ query, ean, maxDomains = 30, category = 'products', userId = null, userLocation = null, geoEnabled = false }) {
  if (!query && !ean) {
    throw new Error('Either query or ean is required');
  }

  const searchTerm = query || ean;
  console.log(`[Crawler Search] Searching for: ${searchTerm}`);

  // ROTATION SYSTEM - każdy user dostaje RÓŻNE sklepy!
  const useRotation = process.env.ROTATION_ENABLED !== 'false';
  let targetDomains;
  
  if (useRotation && userId) {
    // ROTATION MODE - inteligentny wybór z rotacją
    const rotationSystem = new RotationSystem(global.redisClient);
    targetDomains = await rotationSystem.selectDomainsForUser(userId, searchTerm, {
      userLocation,
      geoEnabled,
      maxDomains
    });
    
    // Stats
    const stats = await rotationSystem.getStats(userId, searchTerm);
    console.log(`[Crawler Search] 🔄 ROTATION: ${targetDomains.length} domains (${stats.seenDomains} seen, ${stats.coverage}% coverage)`);
    
  } else if (process.env.USE_SMART_TARGETING !== 'false') {
    // SMART TARGETING - tylko najlepsze domeny (bez rotacji)
    targetDomains = smartTargeting.selectBestDomains(searchTerm, category, {
      maxDomains: Math.min(maxDomains, 5),
      includeBackup: true
    });
    console.log(`[Crawler Search] 🎯 SMART: Targeting ${targetDomains.length} best domains`);
    
  } else {
    // RANDOM - stary sposób (na ślepo)
    targetDomains = selectTargetDomains(maxDomains, category);
    console.log(`[Crawler Search] 🔀 RANDOM: Targeting ${targetDomains.length} domains`);
  }

  // Generate search URLs for each domain with MULTI-FALLBACK
  const searchUrls = [];
  for (const domain of targetDomains) {
    // Próbuj wiele URL patterns aż znajdziesz działający
    let url = await tryMultipleUrls(domain, searchTerm, directScraper);
    
    // URL BYPASS - dodaj parametry cookie consent żeby ominąć cookie bannery
    const cookieBypass = url.includes('?') ? '&cookies=accepted&consent=1' : '?cookies=accepted&consent=1';
    url = url + cookieBypass;
    
    searchUrls.push({
      url,
      options: {
        category,
        ean,
        searchQuery: query
      },
      domain
    });
  }

  // Scrape all domains directly (parallel with concurrency limit)
  const results = await directScraper.scrapeMultiple(searchUrls, {
    concurrency: 3 // Only 3 at a time to avoid overwhelming servers
  });

  // Collect all offers from successful scrapes
  const allOffers = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result && result.offers && Array.isArray(result.offers)) {
      // Add source domain to each offer
      const offersWithSource = result.offers.map(offer => ({
        ...offer,
        _source: 'crawler',
        _domain: searchUrls[i].domain,
        _cached: result.cached || false
      }));
      allOffers.push(...offersWithSource);
      
      // UCZENIE SIĘ - zapisz wyniki dla smart targeting
      if (process.env.USE_SMART_TARGETING !== 'false' && result.offers.length > 0) {
        const avgPrice = result.offers.reduce((sum, o) => sum + (o.price || 0), 0) / result.offers.length;
        smartTargeting.recordResult(searchTerm, category, searchUrls[i].domain, avgPrice);
      }
    }
  }

  console.log(`[Crawler Search] Found ${allOffers.length} offers from ${targetDomains.length} domains`);
  
  // Sort by price (lowest first)
  const sorted = allOffers.sort((a, b) => (a.price || 0) - (b.price || 0));
  
  // Log savings
  if (process.env.USE_SMART_TARGETING !== 'false' && targetDomains.length < maxDomains) {
    const saved = maxDomains - targetDomains.length;
    console.log(`[Crawler Search] 💰 Saved ${saved} requests (${saved * 500}KB) with smart targeting!`);
  }
  
  return sorted;
}

/**
 * Select target domains based on category and max count
 * Returns mix of 60% niszowe + 40% giganci (for best deals)
 */
function selectTargetDomains(maxDomains, category) {
  // Load category-specific domains from JSON files
  const dienstenDomains = loadDienstenDomains(category);
  const financeDomains = loadFinanceDomains(category);
  
  // If we have category-specific domains, use them
  if (dienstenDomains.length > 0) {
    return dienstenDomains.slice(0, maxDomains);
  }
  
  if (financeDomains.length > 0) {
    return financeDomains.slice(0, maxDomains);
  }
  
  // Fallback to general product domains (giganci + niszowe)
  const giganci = domains.giganci || [];
  const niszowe = domains.niszowe || [];

  // Calculate 60/40 split
  const niszoweCount = Math.ceil(maxDomains * 0.6);
  const giganciCount = maxDomains - niszoweCount;

  // Take top domains from each group
  const selectedNiszowe = niszowe.slice(0, niszoweCount);
  const selectedGiganci = giganci.slice(0, giganciCount);

  return [...selectedNiszowe, ...selectedGiganci];
}

/**
 * Load diensten domains for specific category
 */
function loadDienstenDomains(category) {
  try {
    const diensten = require('./domains/diensten.json');
    const categoryMap = {
      'energie': 'energie',
      'energy': 'energie',
      'telecom': 'telecom',
      'verzekeringen': 'verzekeringen',
      'insurance': 'verzekeringen',
      'vakanties': 'vakanties',
      'vacations': 'vakanties'
    };
    
    const subcategory = categoryMap[category];
    if (subcategory && diensten.subcategories && diensten.subcategories[subcategory]) {
      return diensten.subcategories[subcategory].domains.map(d => d.domain);
    }
  } catch (err) {
    // Ignore - fallback to general domains
  }
  return [];
}

/**
 * Load finance domains for specific category
 */
function loadFinanceDomains(category) {
  try {
    const finance = require('./domains/finance.json');
    const categoryMap = {
      'hypotheken': 'hypotheken',
      'mortgage': 'hypotheken',
      'leningen': 'leningen',
      'loan': 'leningen',
      'leasing': 'leasing',
      'creditcards': 'creditcards',
      'creditcard': 'creditcards'
    };
    
    const subcategory = categoryMap[category];
    if (subcategory && finance.subcategories && finance.subcategories[subcategory]) {
      return finance.subcategories[subcategory].domains.map(d => d.domain);
    }
  } catch (err) {
    // Ignore - fallback to general domains
  }
  return [];
}

/**
 * Generate search URL for a domain
 * Uses common NL e-commerce search patterns
 */
function generateSearchUrl(domain, searchTerm) {
  const encoded = encodeURIComponent(searchTerm);
  
  // Domain-specific search URL patterns (VERIFIED 2026-03-19)
  const patterns = {
    // E-commerce - TOP 5 (verified working)
    'bol.com': `https://www.bol.com/nl/nl/s/?searchtext=${encoded}`,
    'coolblue.nl': `https://www.coolblue.nl/zoeken?query=${encoded}`,
    'mediamarkt.nl': `https://www.mediamarkt.nl/nl/search.html?query=${encoded}`,
    'alternate.nl': `https://www.alternate.nl/html/search.html?query=${encoded}`,
    'azerty.nl': `https://azerty.nl/zoeken?q=${encoded}`,
    
    // E-commerce - Other
    'amazon.nl': `https://www.amazon.nl/s?k=${encoded}`,
    'wehkamp.nl': `https://www.wehkamp.nl/zoeken/?searchTerm=${encoded}`,
    'beslist.nl': `https://www.beslist.nl/products/search?searchfor=${encoded}`,
    
    // Diensten - Energie
    'gaslicht.com': `https://www.gaslicht.com/energie`,
    'energievergelijk.nl': `https://www.energievergelijk.nl/`,
    'independer.nl': `https://www.independer.nl/energie/intro.aspx`,
    'pricewise.nl': `https://www.pricewise.nl/energie/`,
    
    // Diensten - Telecom
    'belsimpel.nl': `https://www.belsimpel.nl/`,
    'mobiel.nl': `https://www.mobiel.nl/`,
    'kpn.com': `https://www.kpn.com/`,
    'ziggo.nl': `https://www.ziggo.nl/`,
    
    // Diensten - Verzekeringen
    'zorgwijzer.nl': `https://www.zorgwijzer.nl/`,
    
    // Diensten - Vakanties
    'booking.com': `https://www.booking.com/searchresults.html?ss=${encoded}`,
    'tui.nl': `https://www.tui.nl/`,
    'corendon.nl': `https://www.corendon.nl/`,
    
    // Finance - Hypotheken
    'hypotheker.nl': `https://www.hypotheker.nl/`,
    'dehypotheekshop.nl': `https://www.dehypotheekshop.nl/`,
    'ing.nl': `https://www.ing.nl/particulier/hypotheken/`,
    'rabobank.nl': `https://www.rabobank.nl/particulieren/hypotheek/`,
    
    // Finance - Leningen
    'geldshop.nl': `https://www.geldshop.nl/`,
    'moneyou.nl': `https://www.moneyou.nl/`,
    'nn.nl': `https://www.nn.nl/`,
    
    // Finance - Leasing
    'directlease.nl': `https://www.directlease.nl/`,
    'leaseplan.com': `https://www.leaseplan.com/nl-nl/`,
    'alphabet.nl': `https://www.alphabet.nl/`
  };
  
  // Return domain-specific URL if exists, otherwise generic pattern
  if (patterns[domain]) {
    return patterns[domain];
  }
  
  // Fallback: generic search URL
  return `https://www.${domain}/zoeken?q=${encoded}`;
}

/**
 * Search by product name
 */
async function searchByName(productName, options = {}) {
  return searchProduct({
    query: productName,
    ean: null,
    maxDomains: options.maxDomains || 30,
    category: options.category || 'products'
  });
}

module.exports = {
  searchProduct,
  searchByName
};
