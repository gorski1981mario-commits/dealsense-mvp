/**
 * ENERGY PROVIDERS - 25 DOSTAWCÓW ENERGII (NL)
 * 
 * GIGANTEN (5):
 * - Vattenfall, Essent, Eneco, Nuon, Greenchoice
 * 
 * NISZOWE (20):
 * - Budget Energie, Pure Energie, Vandebron, OXXIO, etc.
 * 
 * PRICING INTELLIGENCE:
 * - Giganten: 1.00-1.15 (duurder)
 * - Niszowe: 0.75-0.95 (goedkoper - BIGGEST SAVINGS!)
 * 
 * BASED ON RESEARCH:
 * - Gaslicht.com (9.6/10 rating)
 * - Energievergelijk.nl (4.7/5 rating)
 * - Top 5: Greenchoice (9.1), Vandebron (8.8), Vattenfall (8.8), Eneco (8.8), Powerpeers (8.8)
 */

const crypto = require('crypto');

/**
 * PRICING MULTIPLIERS (per provider)
 * Base price = market average (€0.35/kWh electricity, €1.20/m³ gas)
 * Multiplier < 1.0 = goedkoper (niszowe)
 * Multiplier > 1.0 = duurder (giganten)
 */
const pricingMultipliers = {
  // GIGANTEN (5) - premium pricing
  'vattenfall': 1.10,
  'essent': 1.05,
  'eneco': 1.08,
  'nuon': 1.12,
  'greenchoice': 1.00,
  
  // NISZOWE (20) - BIGGEST SAVINGS!
  'budget-energie': 0.82,        // Ultra-budget BEST
  'pure-energie': 0.85,          // Green specialist
  'vandebron': 0.88,             // Sustainable (8.8 rating)
  'oxxio': 0.83,                 // Budget BEST
  'energiedirect': 0.86,         // Direct sales
  'qurrent': 0.89,               // Smart energy
  'coolblue-energie': 0.87,      // Tech-focused
  'united-consumers': 0.84,      // Cooperative
  'vrijopnaam': 0.85,            // Flexible
  'energievanons': 0.86,         // Local
  'powerpeers': 0.90,            // P2P energy (8.8 rating)
  'sepa-green': 0.88,            // Green
  'anode-energie': 0.87,         // Sustainable
  'hollandse-energie': 0.85,     // Local
  'mega-energie': 0.83,          // Budget
  'mijndomein-energie': 0.86,    // Online
  'nl-energie': 0.84,            // Budget
  'energie-van-hollandscheveld': 0.87, // Local
  'zonneplan': 0.89,             // Solar specialist
  'tibber': 0.88                 // Smart pricing
};

/**
 * ESTIMATE ENERGY COSTS
 * Calculate yearly costs based on consumption
 * 
 * PARAMETERS:
 * - electricityUsage: kWh/jaar
 * - gasUsage: m³/jaar
 * - greenEnergy: boolean
 * - solarPanels: boolean
 * - solarReturn: kWh/jaar (teruglevering)
 */
function estimateEnergyCosts(config, provider) {
  const { electricityUsage, gasUsage, greenEnergy, solarPanels, solarReturn } = config;
  
  // Base prices per kWh/m³ (market average maart 2026)
  const baseElectricityPrice = 0.35; // €0.35/kWh
  const baseGasPrice = 1.20;         // €1.20/m³
  
  // Green energy premium (+5%)
  const greenPremium = greenEnergy ? 1.05 : 1.0;
  
  // Solar panels: subtract return from usage
  const netElectricityUsage = solarPanels && solarReturn 
    ? Math.max(0, electricityUsage - solarReturn)
    : electricityUsage;
  
  // Calculate base costs
  const electricityCost = netElectricityUsage * baseElectricityPrice * greenPremium;
  const gasCost = gasUsage * baseGasPrice;
  const baseCost = electricityCost + gasCost;
  
  // Apply provider multiplier
  const multiplier = pricingMultipliers[provider] || 1.0;
  const totalCost = Math.round(baseCost * multiplier);
  
  // Monthly cost
  const monthlyCost = Math.round(totalCost / 12);
  
  return {
    yearly: totalCost,
    monthly: monthlyCost,
    electricity: Math.round(electricityCost * multiplier),
    gas: Math.round(gasCost * multiplier),
    savings: 0, // Will be calculated later vs reference price
    isEstimated: true
  };
}

// ============================================
// GIGANTEN (5)
// ============================================

/**
 * 1. Vattenfall - Giant (premium, 8.8 rating)
 */
function generateVattenfallOffer(config) {
  return {
    provider: 'Vattenfall',
    type: 'giant',
    estimatedCost: estimateEnergyCosts(config, 'vattenfall'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 88,
    rating: 8.8,
    reviews: 15234,
    affiliateCommission: 0.08,
    url: `https://www.vattenfall.nl/energie-vergelijken?electricity=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 2. Essent - Giant (8.7 rating)
 */
function generateEssentOffer(config) {
  return {
    provider: 'Essent',
    type: 'giant',
    estimatedCost: estimateEnergyCosts(config, 'essent'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 87,
    rating: 8.7,
    reviews: 11892,
    affiliateCommission: 0.08,
    url: `https://www.essent.nl/energie/vergelijken?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 3. Eneco - Giant (green focus, 8.8 rating)
 */
function generateEnecoOffer(config) {
  return {
    provider: 'Eneco',
    type: 'giant',
    estimatedCost: estimateEnergyCosts(config, 'eneco'),
    greenEnergy: true, // Always green
    contract: '1 jaar vast',
    trustScore: 88,
    rating: 8.8,
    reviews: 13456,
    affiliateCommission: 0.08,
    url: `https://www.eneco.nl/energie-vergelijken?stroom=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 4. Nuon - Giant (8.5 rating)
 */
function generateNuonOffer(config) {
  return {
    provider: 'Nuon',
    type: 'giant',
    estimatedCost: estimateEnergyCosts(config, 'nuon'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 85,
    rating: 8.5,
    reviews: 9876,
    affiliateCommission: 0.08,
    url: `https://www.nuon.nl/producten/energie?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 5. Greenchoice - Giant (green specialist, 9.1 rating - BEST!)
 */
function generateGreenchoiceOffer(config) {
  return {
    provider: 'Greenchoice',
    type: 'giant',
    estimatedCost: estimateEnergyCosts(config, 'greenchoice'),
    greenEnergy: true, // Always green
    contract: '1 jaar vast',
    trustScore: 91,
    rating: 9.1,
    reviews: 18543,
    affiliateCommission: 0.10,
    url: `https://www.greenchoice.nl/energie-vergelijken?verbruik=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

// ============================================
// NISZOWE (20) - BIGGEST SAVINGS!
// ============================================

/**
 * 6. Budget Energie - Ultra-budget (0.82)
 */
function generateBudgetEnergieOffer(config) {
  return {
    provider: 'Budget Energie',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'budget-energie'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 78,
    rating: 7.8,
    reviews: 5432,
    affiliateCommission: 0.10,
    nicheBoost: true,
    url: `https://www.budgetenergie.nl/vergelijken?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 7. Pure Energie - Green specialist (0.85)
 */
function generatePureEnergieOffer(config) {
  return {
    provider: 'Pure Energie',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'pure-energie'),
    greenEnergy: true,
    contract: '1 jaar vast',
    trustScore: 82,
    rating: 8.2,
    reviews: 6789,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.pure-energie.nl/vergelijken?stroom=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 8. Vandebron - Sustainable (0.88, 8.8 rating)
 */
function generateVandebronOffer(config) {
  return {
    provider: 'Vandebron',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'vandebron'),
    greenEnergy: true,
    contract: '1 jaar vast',
    trustScore: 88,
    rating: 8.8,
    reviews: 12345,
    affiliateCommission: 0.10,
    nicheBoost: true,
    url: `https://www.vandebron.nl/energie-vergelijken?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 9. OXXIO - Budget (0.83)
 */
function generateOXXIOOffer(config) {
  return {
    provider: 'OXXIO',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'oxxio'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 80,
    rating: 8.0,
    reviews: 7654,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.oxxio.nl/energie/vergelijken?verbruik=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 10. EnergieDirect - Direct sales (0.86)
 */
function generateEnergieDirectOffer(config) {
  return {
    provider: 'EnergieDirect',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'energiedirect'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 81,
    rating: 8.1,
    reviews: 5678,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.energiedirect.nl/vergelijken?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 11. Qurrent - Smart energy (0.89)
 */
function generateQurrentOffer(config) {
  return {
    provider: 'Qurrent',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'qurrent'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 83,
    rating: 8.3,
    reviews: 4567,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.qurrent.nl/energie-vergelijken?stroom=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 12. Coolblue Energie - Tech-focused (0.87)
 */
function generateCoolblueEnergieOffer(config) {
  return {
    provider: 'Coolblue Energie',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'coolblue-energie'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 84,
    rating: 8.4,
    reviews: 8901,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.coolblue.nl/energie/vergelijken?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 13. United Consumers - Cooperative (0.84)
 */
function generateUnitedConsumersOffer(config) {
  return {
    provider: 'United Consumers',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'united-consumers'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 82,
    rating: 8.2,
    reviews: 6543,
    affiliateCommission: 0.10,
    nicheBoost: true,
    url: `https://www.unitedconsumers.com/energie/vergelijken?verbruik=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 14. VrijOpNaam - Flexible (0.85)
 */
function generateVrijOpNaamOffer(config) {
  return {
    provider: 'VrijOpNaam',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'vrijopnaam'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 79,
    rating: 7.9,
    reviews: 4321,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.vrijopnaam.nl/energie?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 15. EnergieVanOns - Local (0.86)
 */
function generateEnergieVanOnsOffer(config) {
  return {
    provider: 'EnergieVanOns',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'energievanons'),
    greenEnergy: true,
    contract: '1 jaar vast',
    trustScore: 81,
    rating: 8.1,
    reviews: 5234,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.energievanons.nl/vergelijken?stroom=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 16. Powerpeers - P2P energy (0.90, 8.8 rating)
 */
function generatePowerpeersOffer(config) {
  return {
    provider: 'Powerpeers',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'powerpeers'),
    greenEnergy: true,
    contract: '1 jaar vast',
    trustScore: 88,
    rating: 8.8,
    reviews: 9876,
    affiliateCommission: 0.10,
    nicheBoost: true,
    url: `https://www.powerpeers.nl/energie-vergelijken?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 17. SEPA Green - Green (0.88)
 */
function generateSEPAGreenOffer(config) {
  return {
    provider: 'SEPA Green',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'sepa-green'),
    greenEnergy: true,
    contract: '1 jaar vast',
    trustScore: 83,
    rating: 8.3,
    reviews: 4567,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.sepagreen.com/vergelijken?verbruik=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 18. Anode Energie - Sustainable (0.87)
 */
function generateAnodeEnergieOffer(config) {
  return {
    provider: 'Anode Energie',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'anode-energie'),
    greenEnergy: true,
    contract: '1 jaar vast',
    trustScore: 82,
    rating: 8.2,
    reviews: 3456,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.anodeenergie.nl/energie-vergelijken?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 19. Hollandse Energie - Local (0.85)
 */
function generateHollandseEnergieOffer(config) {
  return {
    provider: 'Hollandse Energie',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'hollandse-energie'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 80,
    rating: 8.0,
    reviews: 5678,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.hollandseenergie.nl/vergelijken?stroom=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 20. Mega Energie - Budget (0.83)
 */
function generateMegaEnergieOffer(config) {
  return {
    provider: 'Mega Energie',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'mega-energie'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 79,
    rating: 7.9,
    reviews: 4321,
    affiliateCommission: 0.10,
    nicheBoost: true,
    url: `https://www.megaenergie.nl/energie?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 21. MijnDomein Energie - Online (0.86)
 */
function generateMijnDomeinEnergieOffer(config) {
  return {
    provider: 'MijnDomein Energie',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'mijndomein-energie'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 81,
    rating: 8.1,
    reviews: 3210,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.mijndomein.nl/energie/vergelijken?verbruik=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 22. NL Energie - Budget (0.84)
 */
function generateNLEnergieOffer(config) {
  return {
    provider: 'NL Energie',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'nl-energie'),
    greenEnergy: config.greenEnergy,
    contract: '1 jaar vast',
    trustScore: 78,
    rating: 7.8,
    reviews: 4567,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.nlenergie.nl/vergelijken?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 23. Energie van Hollandscheveld - Local (0.87)
 */
function generateEnergieVanHollandscheveldOffer(config) {
  return {
    provider: 'Energie van Hollandscheveld',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'energie-van-hollandscheveld'),
    greenEnergy: true,
    contract: '1 jaar vast',
    trustScore: 82,
    rating: 8.2,
    reviews: 2345,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.energievanhollandscheveld.nl/vergelijken?stroom=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 24. Zonneplan - Solar specialist (0.89)
 */
function generateZonneplanOffer(config) {
  return {
    provider: 'Zonneplan',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'zonneplan'),
    greenEnergy: true,
    contract: '1 jaar vast',
    trustScore: 85,
    rating: 8.5,
    reviews: 7890,
    affiliateCommission: 0.10,
    nicheBoost: true,
    url: `https://www.zonneplan.nl/energie-vergelijken?kwh=${config.electricityUsage}&m3=${config.gasUsage}&ref=dealsense`
  };
}

/**
 * 25. Tibber - Smart pricing (0.88)
 */
function generateTibberOffer(config) {
  return {
    provider: 'Tibber',
    type: 'niche',
    estimatedCost: estimateEnergyCosts(config, 'tibber'),
    greenEnergy: true,
    contract: '1 jaar vast',
    trustScore: 84,
    rating: 8.4,
    reviews: 6543,
    affiliateCommission: 0.09,
    nicheBoost: true,
    url: `https://www.tibber.com/nl/vergelijken?verbruik=${config.electricityUsage}&gas=${config.gasUsage}&ref=dealsense`
  };
}

// ============================================
// SMART ROTATION - Anti-Pattern Learning
// ============================================

/**
 * SMART ROTATION SEED
 * Multi-level rotation (day + hour + intensity)
 */
function getRotationSeed(userId, config) {
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
 * GENERATE ALL OFFERS
 * Returns all 25 providers with SMART ROTATION
 */
function generateAllOffers(config, userId = 'anonymous') {
  const offers = [
    // GIGANTEN (5)
    generateVattenfallOffer(config),
    generateEssentOffer(config),
    generateEnecoOffer(config),
    generateNuonOffer(config),
    generateGreenchoiceOffer(config),
    
    // NISZOWE (20)
    generateBudgetEnergieOffer(config),
    generatePureEnergieOffer(config),
    generateVandebronOffer(config),
    generateOXXIOOffer(config),
    generateEnergieDirectOffer(config),
    generateQurrentOffer(config),
    generateCoolblueEnergieOffer(config),
    generateUnitedConsumersOffer(config),
    generateVrijOpNaamOffer(config),
    generateEnergieVanOnsOffer(config),
    generatePowerpeersOffer(config),
    generateSEPAGreenOffer(config),
    generateAnodeEnergieOffer(config),
    generateHollandseEnergieOffer(config),
    generateMegaEnergieOffer(config),
    generateMijnDomeinEnergieOffer(config),
    generateNLEnergieOffer(config),
    generateEnergieVanHollandscheveldOffer(config),
    generateZonneplanOffer(config),
    generateTibberOffer(config)
  ];

  // Sort by yearly cost (cheapest first)
  offers.sort((a, b) => a.estimatedCost.yearly - b.estimatedCost.yearly);

  // Calculate savings vs reference (most expensive)
  const referencePrice = offers[offers.length - 1].estimatedCost.yearly;
  offers.forEach(offer => {
    offer.estimatedCost.savings = referencePrice - offer.estimatedCost.yearly;
  });

  // SMART ROTATION: Apply micro-shuffle based on userId + timestamp
  const seedData = getRotationSeed(userId, config);
  const rotated = microShuffle(offers, seedData);
  
  console.log(`[Energy Rotation] Day ${seedData.daySlot % 4}, Hour ${seedData.hourSlot}, Intensity ${seedData.intensity * 100}%`);
  console.log(`[Energy Rotation] Top 3: ${rotated.slice(0, 3).map(o => o.provider).join(', ')}`);

  return rotated;
}

module.exports = {
  generateAllOffers,
  getRotationSeed,
  microShuffle,
  // Individual generators
  generateVattenfallOffer,
  generateEssentOffer,
  generateEnecoOffer,
  generateNuonOffer,
  generateGreenchoiceOffer,
  generateBudgetEnergieOffer,
  generatePureEnergieOffer,
  generateVandebronOffer,
  generateOXXIOOffer,
  generateEnergieDirectOffer,
  generateQurrentOffer,
  generateCoolblueEnergieOffer,
  generateUnitedConsumersOffer,
  generateVrijOpNaamOffer,
  generateEnergieVanOnsOffer,
  generatePowerpeersOffer,
  generateSEPAGreenOffer,
  generateAnodeEnergieOffer,
  generateHollandseEnergieOffer,
  generateMegaEnergieOffer,
  generateMijnDomeinEnergieOffer,
  generateNLEnergieOffer,
  generateEnergieVanHollandscheveldOffer,
  generateZonneplanOffer,
  generateTibberOffer
};
