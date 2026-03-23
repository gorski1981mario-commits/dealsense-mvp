/**
 * Vacation Configuration Matcher
 * 
 * STRATEGIA:
 * 1. User buduje konfigurację (destination, dates, adults, children, stars, board)
 * 2. Generujemy smart queries dla tej konfiguracji
 * 3. Szukamy ofert w Google Shopping (TUI, Corendon, Sunweb, etc.)
 * 4. Matchujemy konfiguracje (destination, dates, adults, stars, board)
 * 5. Wyciągamy ceny z dopasowanych ofert
 * 6. Zwracamy TOP oferty z linkami do biur podróży
 */

const axios = require('axios');

const API_KEY = process.env.GOOGLE_SHOPPING_API_KEY;

/**
 * Generate smart queries for vacation configuration
 */
function generateVacationQueries(config) {
  const {
    destination,
    duration,
    adults,
    children,
    stars,
    board,
    departureAirport = 'Amsterdam'
  } = config;
  
  const totalPersons = adults + (children || 0);
  
  // Board type mapping (NL)
  const boardNL = {
    'room_only': 'logies',
    'breakfast': 'ontbijt',
    'half_board': 'halfpension',
    'full_board': 'volpension',
    'all_inclusive': 'all inclusive'
  };
  
  const boardType = boardNL[board] || 'all inclusive';
  
  // Generate queries targeting Dutch travel agencies
  const queries = [
    // TUI specific
    `TUI ${destination} ${duration} dagen ${boardType}`,
    `TUI vakantie ${destination} ${stars} sterren ${boardType}`,
    `TUI ${destination} ${totalPersons} personen ${boardType}`,
    
    // Corendon specific
    `Corendon ${destination} ${boardType} ${duration} dagen`,
    `Corendon reis ${destination} ${stars} sterren`,
    `Corendon ${destination} ${totalPersons} personen`,
    
    // Sunweb specific
    `Sunweb ${destination} vakantie ${boardType}`,
    `Sunweb ${destination} ${duration} dagen`,
    
    // D-reizen
    `D-reizen ${destination} ${boardType}`,
    
    // Generic (catches all agencies)
    `${destination} vakantie ${boardType} ${duration} dagen ${totalPersons} personen`,
    `${destination} reis ${stars} sterren ${boardType} vertrek ${departureAirport}`,
    `${boardType} vakantie ${destination} ${duration} dagen`,
    `${destination} ${stars} sterren hotel ${boardType} ${duration} nachten`
  ];
  
  return queries;
}

/**
 * Match configuration parameters
 * Returns match score 0-100
 */
function matchConfiguration(offer, userConfig) {
  const title = (offer.title || '').toLowerCase();
  const description = (offer.snippet || '').toLowerCase();
  const combined = `${title} ${description}`;
  
  let score = 0;
  let maxScore = 0;
  
  // 1. Destination match (30 points)
  maxScore += 30;
  if (combined.includes(userConfig.destination.toLowerCase())) {
    score += 30;
  }
  
  // 2. Duration match (20 points)
  maxScore += 20;
  const durationPatterns = [
    `${userConfig.duration} dagen`,
    `${userConfig.duration} nachten`,
    `${userConfig.duration}d`,
    `${userConfig.duration}n`
  ];
  if (durationPatterns.some(pattern => combined.includes(pattern))) {
    score += 20;
  }
  
  // 3. Board type match (20 points)
  maxScore += 20;
  const boardNL = {
    'room_only': ['logies', 'room only'],
    'breakfast': ['ontbijt', 'breakfast'],
    'half_board': ['halfpension', 'half board', 'halfboard'],
    'full_board': ['volpension', 'full board', 'fullboard'],
    'all_inclusive': ['all inclusive', 'all-inclusive', 'ai']
  };
  const boardPatterns = boardNL[userConfig.board] || [];
  if (boardPatterns.some(pattern => combined.includes(pattern))) {
    score += 20;
  }
  
  // 4. Stars match (15 points)
  maxScore += 15;
  const starsPatterns = [
    `${userConfig.stars} sterren`,
    `${userConfig.stars}*`,
    `${userConfig.stars} star`
  ];
  if (starsPatterns.some(pattern => combined.includes(pattern))) {
    score += 15;
  }
  
  // 5. Persons match (15 points)
  maxScore += 15;
  const totalPersons = userConfig.adults + (userConfig.children || 0);
  const personsPatterns = [
    `${totalPersons} personen`,
    `${totalPersons} pers`,
    `${userConfig.adults} volwassenen`
  ];
  if (personsPatterns.some(pattern => combined.includes(pattern))) {
    score += 15;
  }
  
  // Calculate percentage
  const matchPercentage = Math.round((score / maxScore) * 100);
  
  return {
    score: matchPercentage,
    details: {
      destination: combined.includes(userConfig.destination.toLowerCase()),
      duration: durationPatterns.some(p => combined.includes(p)),
      board: boardPatterns.some(p => combined.includes(p)),
      stars: starsPatterns.some(p => combined.includes(p)),
      persons: personsPatterns.some(p => combined.includes(p))
    }
  };
}

/**
 * Search and match vacation offers
 */
async function searchVacationOffers(userConfig) {
  console.log('[VacationMatcher] Searching offers for configuration:', userConfig);
  
  const queries = generateVacationQueries(userConfig);
  const allOffers = [];
  
  for (const query of queries) {
    try {
      const params = {
        engine: 'google_shopping',
        q: query,
        gl: 'nl',
        hl: 'nl',
        num: 30,
        api_key: API_KEY
      };
      
      const response = await axios.get('https://www.searchapi.io/api/v1/search', {
        params,
        timeout: 30000
      });
      
      const results = response.data.shopping_results || [];
      
      // Filter vacation packages
      const packages = results.filter(item => {
        const title = (item.title || '').toLowerCase();
        const price = item.extracted_price || 0;
        
        // Must be vacation package
        const isPackage = (title.includes('vakantie') || title.includes('reis')) &&
                         !title.includes('verzekering') &&
                         !title.includes('boek') &&
                         !title.includes('gids');
        
        // Must have reasonable price
        const hasPrice = price >= 300 && price <= 5000;
        
        return isPackage && hasPrice;
      });
      
      allOffers.push(...packages);
      
    } catch (error) {
      console.error('[VacationMatcher] Query error:', error.message);
    }
  }
  
  // Deduplicate
  const uniqueOffers = [];
  const seen = new Set();
  
  for (const offer of allOffers) {
    const key = `${offer.title}-${offer.extracted_price}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueOffers.push(offer);
    }
  }
  
  console.log(`[VacationMatcher] Found ${uniqueOffers.length} unique offers`);
  
  // Match configurations
  const matchedOffers = uniqueOffers.map(offer => {
    const match = matchConfiguration(offer, userConfig);
    return {
      ...offer,
      matchScore: match.score,
      matchDetails: match.details
    };
  });
  
  // Filter by minimum match score (60%)
  const goodMatches = matchedOffers.filter(offer => offer.matchScore >= 60);
  
  // Sort by match score (best first), then by price (cheapest first)
  goodMatches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return (a.extracted_price || 0) - (b.extracted_price || 0);
  });
  
  console.log(`[VacationMatcher] Found ${goodMatches.length} good matches (score >= 60%)`);
  
  // Return top 10
  return goodMatches.slice(0, 10).map(offer => ({
    title: offer.title,
    price: offer.extracted_price,
    pricePerPerson: Math.round(offer.extracted_price / (userConfig.adults + (userConfig.children || 0))),
    seller: offer.source,
    link: offer.link,
    matchScore: offer.matchScore,
    matchDetails: offer.matchDetails,
    thumbnail: offer.thumbnail,
    rating: offer.rating
  }));
}

module.exports = {
  searchVacationOffers,
  generateVacationQueries,
  matchConfiguration
};
