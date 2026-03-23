/**
 * Vacation Deep Links Generator
 * 
 * Generuje deep links do holenderskich biur podróży z parametrami konfiguracji
 * 
 * BIURA PODRÓŻY:
 * - TUI.nl
 * - Corendon.nl
 * - Sunweb.nl
 * - D-reizen.nl
 * - Prijsvrij.nl
 */

/**
 * Map destination to codes used by travel agencies
 */
const destinationMap = {
  'Turkije': {
    tui: 'turkije',
    corendon: 'turkije',
    sunweb: 'turkije',
    dreizen: 'turkey',
    country: 'TR'
  },
  'Spanje': {
    tui: 'spanje',
    corendon: 'spanje',
    sunweb: 'spanje',
    dreizen: 'spain',
    country: 'ES'
  },
  'Griekenland': {
    tui: 'griekenland',
    corendon: 'griekenland',
    sunweb: 'griekenland',
    dreizen: 'greece',
    country: 'GR'
  },
  'Egypte': {
    tui: 'egypte',
    corendon: 'egypte',
    sunweb: 'egypte',
    dreizen: 'egypt',
    country: 'EG'
  },
  'Portugal': {
    tui: 'portugal',
    corendon: 'portugal',
    sunweb: 'portugal',
    dreizen: 'portugal',
    country: 'PT'
  },
  'Italië': {
    tui: 'italie',
    corendon: 'italie',
    sunweb: 'italie',
    dreizen: 'italy',
    country: 'IT'
  },
  'Dominicaanse Republiek': {
    tui: 'dominicaanse-republiek',
    corendon: 'dominicaanse-republiek',
    sunweb: 'dominicaanse-republiek',
    dreizen: 'dominican-republic',
    country: 'DO'
  },
  'Dominikana': {
    tui: 'dominicaanse-republiek',
    corendon: 'dominicaanse-republiek',
    sunweb: 'dominicaanse-republiek',
    dreizen: 'dominican-republic',
    country: 'DO'
  },
  'Tanzania': {
    tui: 'tanzania',
    corendon: 'tanzania',
    sunweb: 'tanzania',
    dreizen: 'tanzania',
    country: 'TZ'
  }
};

/**
 * Map board type to codes
 */
const boardTypeMap = {
  'room_only': {
    tui: 'logies',
    corendon: 'RO',
    sunweb: 'logies',
    code: 'RO'
  },
  'breakfast': {
    tui: 'ontbijt',
    corendon: 'BB',
    sunweb: 'ontbijt',
    code: 'BB'
  },
  'half_board': {
    tui: 'halfpension',
    corendon: 'HB',
    sunweb: 'halfpension',
    code: 'HB'
  },
  'full_board': {
    tui: 'volpension',
    corendon: 'FB',
    sunweb: 'volpension',
    code: 'FB'
  },
  'all_inclusive': {
    tui: 'all-inclusive',
    corendon: 'AI',
    sunweb: 'all-inclusive',
    code: 'AI'
  }
};

/**
 * Generate TUI.nl deep link
 */
function generateTUILink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  const departureDate = config.departureDate.replace(/-/g, '');
  
  // TUI URL structure
  const params = new URLSearchParams({
    destination: dest.tui,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0,
    departureDate: departureDate,
    board: board.tui,
    stars: config.stars
  });
  
  return {
    agency: 'TUI',
    url: `https://www.tui.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'tui'),
    affiliate: true
  };
}

/**
 * Generate Corendon.nl deep link
 */
function generateCorendonLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  const departureDate = config.departureDate.replace(/-/g, '');
  
  const params = new URLSearchParams({
    country: dest.country,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0,
    date: departureDate,
    board: board.corendon,
    category: config.stars
  });
  
  return {
    agency: 'Corendon',
    url: `https://www.corendon.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'corendon'),
    affiliate: true
  };
}

/**
 * Generate Sunweb.nl deep link
 */
function generateSunwebLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  const departureDate = config.departureDate.replace(/-/g, '');
  
  const params = new URLSearchParams({
    destination: dest.sunweb,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    departure: departureDate,
    board: board.sunweb,
    stars: config.stars
  });
  
  return {
    agency: 'Sunweb',
    url: `https://www.sunweb.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'sunweb'),
    affiliate: true
  };
}

/**
 * Generate D-reizen.nl deep link
 */
function generateDreizenLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.dreizen,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'D-reizen',
    url: `https://www.d-reizen.nl/search?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'dreizen'),
    affiliate: true,
    type: 'budget',
    trustScore: 75
  };
}

/**
 * Generate Prijsvrij.nl deep link (NICHE - biggest savings!)
 */
function generatePrijsvrijLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'Prijsvrij',
    url: `https://www.prijsvrij.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'prijsvrij'),
    affiliate: true,
    type: 'niche',
    trustScore: 70,
    nicheBoost: true
  };
}

/**
 * Generate Vliegwinkel.nl deep link (NICHE - flight specialist)
 */
function generateVliegwinkelLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const params = new URLSearchParams({
    destination: dest.country,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0
  });
  
  return {
    agency: 'Vliegwinkel',
    url: `https://www.vliegwinkel.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'vliegwinkel'),
    affiliate: true,
    type: 'niche',
    trustScore: 80,
    nicheBoost: true
  };
}

/**
 * Generate Goedkopevliegtickets.nl deep link (NICHE - budget flights)
 */
function generateGoedkopevliegticketsLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const params = new URLSearchParams({
    destination: dest.country,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0
  });
  
  return {
    agency: 'Goedkopevliegtickets',
    url: `https://www.goedkopevliegtickets.nl/search?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'goedkope'),
    affiliate: true,
    type: 'niche',
    trustScore: 65,
    nicheBoost: true
  };
}

/**
 * Generate Vakantieveilingen.nl deep link (NICHE - auction deals!)
 */
function generateVakantieveilingenLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'Vakantieveilingen',
    url: `https://www.vakantieveilingen.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'veilingen'),
    affiliate: true,
    type: 'niche',
    trustScore: 72,
    nicheBoost: true
  };
}

/**
 * Generate Travelta.nl deep link (NICHE - comparison site)
 */
function generateTraveltaLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.tui
  });
  
  return {
    agency: 'Travelta',
    url: `https://www.travelta.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'travelta'),
    affiliate: true,
    type: 'niche',
    trustScore: 78,
    nicheBoost: true
  };
}

/**
 * Generate Vliegtickets.nl deep link (NICHE - flight specialist)
 */
function generateVliegticketsLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const params = new URLSearchParams({
    destination: dest.country,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0
  });
  
  return {
    agency: 'Vliegtickets',
    url: `https://www.vliegtickets.nl/search?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'vliegtickets'),
    affiliate: true,
    type: 'niche',
    trustScore: 68,
    nicheBoost: true
  };
}

/**
 * Generate Budgetair.nl deep link (NICHE - budget specialist)
 */
function generateBudgetairLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'Budgetair',
    url: `https://www.budgetair.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'budgetair'),
    affiliate: true,
    type: 'niche',
    trustScore: 70,
    nicheBoost: true
  };
}

// ============================================================================
// GIGANCI - DODATKOWI (5-10)
// ============================================================================

/**
 * Generate Neckermann.nl deep link (GIANT - traditional)
 */
function generateNeckermannLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.tui
  });
  
  return {
    agency: 'Neckermann',
    url: `https://www.neckermann.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'neckermann'),
    affiliate: true,
    type: 'giant',
    trustScore: 85
  };
}

/**
 * Generate VakantieDiscounter.nl deep link (GIANT - discount)
 */
function generateVakantieDiscounterLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'VakantieDiscounter',
    url: `https://www.vakantiediscounter.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'vakantiediscounter'),
    affiliate: true,
    type: 'giant',
    trustScore: 80
  };
}

/**
 * Generate Eliza.nl deep link (GIANT - online specialist)
 */
function generateElizaLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.tui
  });
  
  return {
    agency: 'Eliza',
    url: `https://www.eliza.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'eliza'),
    affiliate: true,
    type: 'giant',
    trustScore: 82
  };
}

/**
 * Generate Kras.nl deep link (GIANT - traditional)
 */
function generateKrasLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'Kras',
    url: `https://www.kras.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'kras'),
    affiliate: true,
    type: 'giant',
    trustScore: 83
  };
}

// ============================================================================
// NISZOWE - DODATKOWI (10-15)
// ============================================================================

/**
 * Generate Cheaptickets.nl deep link (NICHE - budget)
 */
function generateCheapticketsLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.country,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'Cheaptickets',
    url: `https://www.cheaptickets.nl/search?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'cheaptickets'),
    affiliate: true,
    type: 'niche',
    trustScore: 68,
    nicheBoost: true
  };
}

/**
 * Generate Vlucht.nl deep link (NICHE - flight specialist)
 */
function generateVluchtLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const params = new URLSearchParams({
    destination: dest.country,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0
  });
  
  return {
    agency: 'Vlucht',
    url: `https://www.vlucht.nl/search?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'vlucht'),
    affiliate: true,
    type: 'niche',
    trustScore: 66,
    nicheBoost: true
  };
}

/**
 * Generate Vliegticketdirect.nl deep link (NICHE - direct flights)
 */
function generateVliegticketdirectLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const params = new URLSearchParams({
    destination: dest.country,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0
  });
  
  return {
    agency: 'Vliegticketdirect',
    url: `https://www.vliegticketdirect.nl/search?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'vliegticketdirect'),
    affiliate: true,
    type: 'niche',
    trustScore: 64,
    nicheBoost: true
  };
}

/**
 * Generate Ticketspy.nl deep link (NICHE - price alerts)
 */
function generateTicketspyLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const params = new URLSearchParams({
    destination: dest.country,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0
  });
  
  return {
    agency: 'Ticketspy',
    url: `https://www.ticketspy.nl/search?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'ticketspy'),
    affiliate: true,
    type: 'niche',
    trustScore: 69,
    nicheBoost: true
  };
}

/**
 * Generate Vliegticketaanbiedingen.nl deep link (NICHE - deals)
 */
function generateVliegticketaanbiedingenLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const params = new URLSearchParams({
    destination: dest.country,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0
  });
  
  return {
    agency: 'Vliegticketaanbiedingen',
    url: `https://www.vliegticketaanbiedingen.nl/search?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'vliegticketaanbiedingen'),
    affiliate: true,
    type: 'niche',
    trustScore: 63,
    nicheBoost: true
  };
}

/**
 * Generate Reisgraag.nl deep link (NICHE - comparison)
 */
function generateReisgraagLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'Reisgraag',
    url: `https://www.reisgraag.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'reisgraag'),
    affiliate: true,
    type: 'niche',
    trustScore: 71,
    nicheBoost: true
  };
}

/**
 * Generate Wegwijzer.nl deep link (NICHE - guide)
 */
function generateWegwijzerLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.tui
  });
  
  return {
    agency: 'Wegwijzer',
    url: `https://www.wegwijzer.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'wegwijzer'),
    affiliate: true,
    type: 'niche',
    trustScore: 67,
    nicheBoost: true
  };
}

/**
 * Generate Vakantieboulevard.nl deep link (NICHE - marketplace)
 */
function generateVakantieboulevardLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'Vakantieboulevard',
    url: `https://www.vakantieboulevard.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'vakantieboulevard'),
    affiliate: true,
    type: 'niche',
    trustScore: 65,
    nicheBoost: true
  };
}

/**
 * Generate Vliegticketzoeker.nl deep link (NICHE - search engine)
 */
function generateVliegticketzoekerLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const params = new URLSearchParams({
    destination: dest.country,
    duration: config.duration,
    adults: config.adults,
    children: config.children || 0
  });
  
  return {
    agency: 'Vliegticketzoeker',
    url: `https://www.vliegticketzoeker.nl/search?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'vliegticketzoeker'),
    affiliate: true,
    type: 'niche',
    trustScore: 62,
    nicheBoost: true
  };
}

/**
 * Generate Reisvoordeel.nl deep link (NICHE - discount deals)
 */
function generateReisvoordeelLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const board = boardTypeMap[config.board];
  
  const params = new URLSearchParams({
    destination: dest.tui,
    nights: config.duration,
    adults: config.adults,
    children: config.children || 0,
    board: board.code
  });
  
  return {
    agency: 'Reisvoordeel',
    url: `https://www.reisvoordeel.nl/zoeken?${params.toString()}`,
    estimatedPrice: estimatePrice(config, 'reisvoordeel'),
    affiliate: true,
    type: 'niche',
    trustScore: 70,
    nicheBoost: true
  };
}

/**
 * Estimate price based on agency pricing patterns
 * 
 * PRICING INTELLIGENCE:
 * - TUI: Premium (+10%)
 * - Corendon: Mid-range (baseline)
 * - Sunweb: Budget (-5%)
 * - D-reizen: Budget (-10%)
 * - Prijsvrij: Niche (-12%) - BIGGEST SAVINGS!
 * - Vliegwinkel: Niche (-8%) - Flight specialist
 * - Goedkopevliegtickets: Niche (-15%) - Budget flights
 */
function estimatePrice(config, agency) {
  // Base calculation: flight + hotel
  const flightPrice = estimateFlightPrice(config);
  const hotelPrice = estimateHotelPrice(config);
  const basePrice = flightPrice + hotelPrice;
  
  // Pricing intelligence multipliers (per agency)
  const multipliers = {
    // GIGANCI (8) - premium pricing
    'tui': 1.10,
    'corendon': 1.00,
    'sunweb': 0.95,
    'dreizen': 0.90,
    'neckermann': 1.08,
    'vakantiediscounter': 0.93,
    'eliza': 0.96,
    'kras': 0.97,
    'kras': 0.97,                   // Traditional
    
    // NISZOWE (17) - BIGGEST SAVINGS!
    'goedkope': 0.85,               // Budget flights
    'veilingen': 0.83,              // Auction deals! BEST
    'budgetair': 0.86,              // Budget specialist
    'vliegtickets': 0.87,           // Flight specialist
    'prijsvrij': 0.88,              // Big savings
    'travelta': 0.89,               // Comparison
    'vliegwinkel': 0.92,            // Flight specialist
    'cheaptickets': 0.84,           // Budget
    'vlucht': 0.86,                 // Flight specialist
    'vliegticketdirect': 0.85,      // Direct flights
    'ticketspy': 0.87,              // Price alerts
    'vliegticketaanbiedingen': 0.82, // Deals BEST
    'reisgraag': 0.88,              // Comparison
    'wegwijzer': 0.86,              // Guide
    'vakantieboulevard': 0.84,      // Marketplace
    'vliegticketzoeker': 0.83,      // Search engine
    'reisvoordeel': 0.87,           // Discount deals
    
    // NOWE NISZOWE (10) - DODATKOWE SAVINGS!
    'holidaydiscounter': 0.87,      // Last minute specialist
    'vakantieveilig': 0.92,         // Safety-focused
    'vliegtickets': 0.86,           // Flight specialist
    'budgetvakantie': 0.84,         // Ultra-budget BEST
    'reisxl': 0.89,                 // XL/Groups specialist
    'vakantiegigant': 0.91,         // Volume player
    'ticketspy': 0.85,              // Price comparison
    'vakantiepiraat': 0.83,         // Deal hunter BEST
    'reisrevolutie': 0.88,          // Modern platform
    'vliegdeals': 0.86              // Deal aggregator
  };
  
  const multiplier = multipliers[agency] || 1.0;
  const totalPrice = Math.round(basePrice * multiplier);
  const pricePerPerson = Math.round(totalPrice / (config.adults + (config.children || 0)));
  
  return {
    total: totalPrice,
    perPerson: pricePerPerson,
    flight: flightPrice,
    hotel: hotelPrice,
    isEstimated: true
  };
}

/**
 * Estimate flight price based on destination
 */
function estimateFlightPrice(config) {
  const totalPersons = config.adults + (config.children || 0);
  
  // Base prices per person (return flight from Amsterdam)
  const flightPrices = {
    'Turkije': 250,
    'Spanje': 200,
    'Griekenland': 280,
    'Egypte': 350,
    'Portugal': 180,
    'Italië': 150
  };
  
  const pricePerPerson = flightPrices[config.destination] || 200;
  return pricePerPerson * totalPersons;
}

/**
 * Estimate hotel price based on stars and board type
 */
function estimateHotelPrice(config) {
  // Base prices per night per person
  const basePrices = {
    '2': 30,
    '3': 50,
    '4': 70,
    '5': 120
  };
  
  // Board type multipliers
  const boardMultipliers = {
    'room_only': 1.0,
    'breakfast': 1.2,
    'half_board': 1.5,
    'full_board': 1.7,
    'all_inclusive': 1.9
  };
  
  const basePrice = basePrices[config.stars] || 50;
  const multiplier = boardMultipliers[config.board] || 1.0;
  const pricePerNight = Math.round(basePrice * multiplier);
  const totalPersons = config.adults + (config.children || 0);
  
  return pricePerNight * config.duration * totalPersons;
}

// ============================================
// NOWE NISZOWE BIURA (10) - DODATKOWE
// ============================================

/**
 * 26. HolidayDiscounter - Last minute + budget specialist
 */
function generateHolidayDiscounterLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.holidaydiscounter.nl/vakantie/${dest.holidaydiscounter || dest.corendon}?adults=${config.adults}&children=${config.children || 0}&nights=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'HolidayDiscounter',
    url,
    estimatedPrice: estimatePrice(config, 'holidaydiscounter'),
    type: 'niche',
    trustScore: 68,
    affiliateCommission: 0.05,
    nicheBoost: true
  };
}

/**
 * 27. VakantieVeilig - Safety-focused specialist
 */
function generateVakantieVeiligLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.vakantieveilig.nl/zoeken?bestemming=${dest.corendon}&volwassenen=${config.adults}&kinderen=${config.children || 0}&nachten=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'VakantieVeilig',
    url,
    estimatedPrice: estimatePrice(config, 'vakantieveilig'),
    type: 'niche',
    trustScore: 72,
    affiliateCommission: 0.05,
    nicheBoost: true
  };
}

/**
 * 28. Vliegtickets.nl - Flight specialist
 */
function generateVliegticketsNLLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.vliegtickets.nl/vakantie/${dest.corendon}?pax=${config.adults + (config.children || 0)}&duration=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'Vliegtickets.nl',
    url,
    estimatedPrice: estimatePrice(config, 'vliegtickets'),
    type: 'niche',
    trustScore: 70,
    affiliateCommission: 0.06,
    nicheBoost: true
  };
}

/**
 * 29. BudgetVakantie - Ultra-budget specialist
 */
function generateBudgetVakantieLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.budgetvakantie.nl/goedkoop/${dest.corendon}?adults=${config.adults}&kids=${config.children || 0}&days=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'BudgetVakantie',
    url,
    estimatedPrice: estimatePrice(config, 'budgetvakantie'),
    type: 'niche',
    trustScore: 65,
    affiliateCommission: 0.06,
    nicheBoost: true
  };
}

/**
 * 30. ReisXL - XL specialist (groups/families)
 */
function generateReisXLLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.reisxl.nl/vakantie/${dest.corendon}?volwassenen=${config.adults}&kinderen=${config.children || 0}&nachten=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'ReisXL',
    url,
    estimatedPrice: estimatePrice(config, 'reisxl'),
    type: 'niche',
    trustScore: 69,
    affiliateCommission: 0.05,
    nicheBoost: true
  };
}

/**
 * 31. VakantieGigant - Volume player
 */
function generateVakantieGigantLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.vakantiegigant.nl/zoeken?land=${dest.corendon}&personen=${config.adults + (config.children || 0)}&nachten=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'VakantieGigant',
    url,
    estimatedPrice: estimatePrice(config, 'vakantiegigant'),
    type: 'niche',
    trustScore: 71,
    affiliateCommission: 0.05,
    nicheBoost: true
  };
}

/**
 * 32. TicketSpy - Price comparison specialist
 */
function generateTicketSpyLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.ticketspy.nl/deals/${dest.corendon}?travelers=${config.adults + (config.children || 0)}&nights=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'TicketSpy',
    url,
    estimatedPrice: estimatePrice(config, 'ticketspy'),
    type: 'niche',
    trustScore: 67,
    affiliateCommission: 0.06,
    nicheBoost: true
  };
}

/**
 * 33. VakantiePiraat - Deal hunter
 */
function generateVakantiePiraatLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.vakantiepraat.nl/deals/${dest.corendon}?pax=${config.adults + (config.children || 0)}&duration=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'VakantiePiraat',
    url,
    estimatedPrice: estimatePrice(config, 'vakantiepiraat'),
    type: 'niche',
    trustScore: 66,
    affiliateCommission: 0.07,
    nicheBoost: true
  };
}

/**
 * 34. ReisRevolutie - Modern platform
 */
function generateReisRevolutieLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.reisrevolutie.nl/vakantie/${dest.corendon}?adults=${config.adults}&children=${config.children || 0}&nights=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'ReisRevolutie',
    url,
    estimatedPrice: estimatePrice(config, 'reisrevolutie'),
    type: 'niche',
    trustScore: 70,
    affiliateCommission: 0.05,
    nicheBoost: true
  };
}

/**
 * 35. VliegDeals - Deal aggregator
 */
function generateVliegDealsLink(config) {
  const dest = destinationMap[config.destination];
  if (!dest) return null;
  
  const url = `https://www.vliegdeals.nl/bestemmingen/${dest.corendon}?personen=${config.adults + (config.children || 0)}&nachten=${config.duration}&ref=dealsense`;
  
  return {
    agency: 'VliegDeals',
    url,
    estimatedPrice: estimatePrice(config, 'vliegdeals'),
    type: 'niche',
    trustScore: 68,
    affiliateCommission: 0.06,
    nicheBoost: true
  };
}

/**
 * Generate all deep links for configuration
 * Returns giganti + niszowe biura (sorted by price)
 * 
 * TOTAL: 35 biur podróży (UPDATED!)
 * - 8 Giganci (TUI, Corendon, Sunweb, D-reizen, Neckermann, VakantieDiscounter, Eliza, Kras)
 * - 27 Niszowe (największe przebicia cenowe!)
 */
/**
 * SMART ROTATION - Anti-Pattern Learning
 * User nie może się nauczyć że jedno biuro jest zawsze najtańsze
 */
function getRotationSeed(userId, config) {
  const crypto = require('crypto');
  const now = Date.now();
  
  // LEVEL 1: Day slot (24h cycle)
  const dayWindow = 86400000; // 24 hours
  const daySlot = Math.floor(now / dayWindow);
  
  // LEVEL 2: Hour slot (within day)
  const hourWindow = 3600000; // 1 hour
  const hourSlot = Math.floor((now % dayWindow) / hourWindow);
  
  // LEVEL 3: Rotation intensity (4-day cycle: 100% → 50% → 25% → 100%)
  const rotationCycle = daySlot % 4;
  const intensityMap = { 0: 1.0, 1: 0.5, 2: 0.25, 3: 1.0 };
  const intensity = intensityMap[rotationCycle];
  
  // Generate deterministic seed
  const seedString = `${userId}-${daySlot}-${hourSlot}-${intensity}`;
  const hash = crypto.createHash('md5').update(seedString).digest('hex');
  const seed = parseInt(hash.substring(0, 8), 16);
  
  return { seed, intensity, daySlot, hourSlot, rotationCycle };
}

/**
 * MICRO-SHUFFLE - Intensity-based rotation
 * 100%: Full shuffle (50% szansy na 1→3, 2→1, 3→2)
 * 50%: Half shuffle (tylko 1↔2)
 * 25%: Quarter shuffle (tylko 2↔3)
 */
function microShuffle(offers, seedData) {
  if (offers.length < 2) return offers;
  
  const shuffled = [...offers];
  let { seed } = seedData;
  const { intensity } = seedData;
  
  // Seeded random
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  if (intensity === 1.0) {
    // 100%: Full shuffle (50% chance to swap top 3)
    if (random() > 0.5 && shuffled.length >= 3) {
      [shuffled[0], shuffled[2]] = [shuffled[2], shuffled[0]];
    }
    if (random() > 0.5 && shuffled.length >= 2) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
  } else if (intensity === 0.5) {
    // 50%: Half shuffle (swap 1↔2)
    if (random() > 0.5 && shuffled.length >= 2) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
  } else if (intensity === 0.25) {
    // 25%: Quarter shuffle (swap 2↔3)
    if (random() > 0.5 && shuffled.length >= 3) {
      [shuffled[1], shuffled[2]] = [shuffled[2], shuffled[1]];
    }
  }
  
  return shuffled;
}

/**
 * Generate all vacation links
 * Returns all agencies with SMART ROTATION (anti-pattern learning)
 */
function generateAllLinks(config, userId = 'anonymous') {
  const links = [
    // GIGANCI (8)
    generateTUILink(config),
    generateCorendonLink(config),
    generateSunwebLink(config),
    generateDreizenLink(config),
    generateNeckermannLink(config),
    generateVakantieDiscounterLink(config),
    generateElizaLink(config),
    generateKrasLink(config),
    
    // NISZOWE (17) - BIGGEST SAVINGS!
    generatePrijsvrijLink(config),
    generateVliegwinkelLink(config),
    generateGoedkopevliegticketsLink(config),
    generateVakantieveilingenLink(config),
    generateTraveltaLink(config),
    generateVliegticketsLink(config),
    generateBudgetairLink(config),
    generateCheapticketsLink(config),
    generateVluchtLink(config),
    generateVliegticketdirectLink(config),
    generateTicketspyLink(config),
    generateVliegticketaanbiedingenLink(config),
    generateReisgraagLink(config),
    generateWegwijzerLink(config),
    generateVakantieboulevardLink(config),
    generateVliegticketzoekerLink(config),
    generateReisvoordeelLink(config),
    
    // NOWE NISZOWE (10)
    generateHolidayDiscounterLink(config),
    generateVakantieVeiligLink(config),
    generateVliegticketsNLLink(config),
    generateBudgetVakantieLink(config),
    generateReisXLLink(config),
    generateVakantieGigantLink(config),
    generateTicketSpyLink(config),
    generateVakantiePiraatLink(config),
    generateReisRevolutieLink(config),
    generateVliegDealsLink(config)
  ].filter(link => link !== null);
  
  // Sort by estimated price (cheapest first)
  links.sort((a, b) => a.estimatedPrice.total - b.estimatedPrice.total);

  // SMART ROTATION: Apply micro-shuffle based on userId + timestamp
  const seedData = getRotationSeed(userId, config);
  const rotated = microShuffle(links, seedData);
  
  console.log(`[Vacation Rotation] Day ${seedData.daySlot % 4}, Hour ${seedData.hourSlot}, Intensity ${seedData.intensity * 100}%`);
  console.log(`[Vacation Rotation] Top 3: ${rotated.slice(0, 3).map(l => l.agency).join(', ')}`);

  return rotated;
}

module.exports = {
  generateAllLinks,
  // Giganci (8)
  generateTUILink,
  generateCorendonLink,
  generateSunwebLink,
  generateDreizenLink,
  generateNeckermannLink,
  generateVakantieDiscounterLink,
  generateElizaLink,
  generateKrasLink,
  // Niszowe (17)
  generatePrijsvrijLink,
  generateVliegwinkelLink,
  generateGoedkopevliegticketsLink,
  generateVakantieveilingenLink,
  generateTraveltaLink,
  generateVliegticketsLink,
  generateBudgetairLink,
  generateCheapticketsLink,
  generateVluchtLink,
  generateVliegticketdirectLink,
  generateTicketspyLink,
  generateVliegticketaanbiedingenLink,
  generateReisgraagLink,
  generateWegwijzerLink,
  generateVakantieboulevardLink,
  generateVliegticketzoekerLink,
  generateReisvoordeelLink,
  // Nowe niszowe (10)
  generateHolidayDiscounterLink,
  generateVakantieVeiligLink,
  generateVliegticketsNLLink,
  generateBudgetVakantieLink,
  generateReisXLLink,
  generateVakantieGigantLink,
  generateTicketSpyLink,
  generateVakantiePiraatLink,
  generateReisRevolutieLink,
  generateVliegDealsLink,
  // Utils
  generateAllLinks,
  getRotationSeed,
  microShuffle
};
