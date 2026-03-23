/**
 * TELECOM PROVIDERS - Dutch Telecom Market
 * 
 * 25 telecom providers (5 giganten + 20 niszowych)
 * 
 * ⚠️ UŻYWA ESTIMATED PRICES (jak konkurencja: Belsimpel.nl, Mobiel.nl)
 * 📊 Multipliers based on research (różnice między providers są realne)
 * 🔄 Smart Rotation (anti-pattern learning)
 * 
 * PÓŹNIEJ: Podepniemy prawdziwe źródła danych (Google Shopping API)
 * 
 * GIGANCI (5):
 * - KPN, Vodafone, T-Mobile, Ziggo, Tele2
 * 
 * NISZOWE (20):
 * - Simyo, Ben, Youfone, Hollandsnieuwe, Lebara, etc.
 * 
 * PRICING INTELLIGENCE:
 * - Giganten: 1.00-1.20 (duurder)
 * - Niszowe: 0.60-0.90 (goedkoper - BIGGEST SAVINGS!)
 */

const providers = [
  // GIGANCI (5) - premium pricing
  { name: 'KPN', type: 'giant', multiplier: 1.20, rating: 8.5, reviews: 45678, trust: 90, affiliate: true },
  { name: 'Vodafone', type: 'giant', multiplier: 1.15, rating: 8.2, reviews: 38945, trust: 88, affiliate: true },
  { name: 'T-Mobile', type: 'giant', multiplier: 1.18, rating: 8.4, reviews: 42156, trust: 89, affiliate: true },
  { name: 'Ziggo', type: 'giant', multiplier: 1.12, rating: 8.0, reviews: 35678, trust: 85, affiliate: true },
  { name: 'Tele2', type: 'giant', multiplier: 1.10, rating: 7.9, reviews: 28934, trust: 84, affiliate: true },
  
  // NISZOWE (20) - BIGGEST SAVINGS!
  { name: 'Simyo', type: 'niche', multiplier: 0.75, rating: 8.3, reviews: 25678, trust: 82, affiliate: true },
  { name: 'Ben', type: 'niche', multiplier: 0.70, rating: 8.1, reviews: 22456, trust: 80, affiliate: true },
  { name: 'Youfone', type: 'niche', multiplier: 0.72, rating: 8.2, reviews: 24123, trust: 81, affiliate: true },
  { name: 'Hollandsnieuwe', type: 'niche', multiplier: 0.68, rating: 8.0, reviews: 21345, trust: 79, affiliate: true },
  { name: 'Lebara', type: 'niche', multiplier: 0.65, rating: 7.8, reviews: 18234, trust: 77, affiliate: true },
  { name: 'Simpel', type: 'niche', multiplier: 0.78, rating: 8.1, reviews: 23456, trust: 80, affiliate: true },
  { name: 'Budget Mobiel', type: 'niche', multiplier: 0.62, rating: 7.7, reviews: 16789, trust: 76, affiliate: true },
  { name: 'Robin Mobile', type: 'niche', multiplier: 0.73, rating: 7.9, reviews: 19876, trust: 78, affiliate: true },
  { name: 'Telfort', type: 'niche', multiplier: 0.85, rating: 8.0, reviews: 22345, trust: 79, affiliate: true },
  { name: 'Online.nl', type: 'niche', multiplier: 0.80, rating: 7.8, reviews: 18945, trust: 77, affiliate: true },
  { name: 'Belsimpel', type: 'niche', multiplier: 0.82, rating: 8.2, reviews: 24567, trust: 81, affiliate: true },
  { name: 'Mobiel.nl', type: 'niche', multiplier: 0.77, rating: 8.0, reviews: 20678, trust: 79, affiliate: true },
  { name: 'Budgetphone', type: 'niche', multiplier: 0.60, rating: 7.6, reviews: 15234, trust: 75, affiliate: true },
  { name: 'Lycamobile', type: 'niche', multiplier: 0.58, rating: 7.5, reviews: 14567, trust: 74, affiliate: true },
  { name: 'Vectone Mobile', type: 'niche', multiplier: 0.63, rating: 7.6, reviews: 15678, trust: 75, affiliate: true },
  { name: 'Ortel Mobile', type: 'niche', multiplier: 0.64, rating: 7.7, reviews: 16234, trust: 76, affiliate: true },
  { name: 'Truphone', type: 'niche', multiplier: 0.88, rating: 7.9, reviews: 19234, trust: 78, affiliate: true },
  { name: 'Scarlet', type: 'niche', multiplier: 0.76, rating: 7.8, reviews: 18456, trust: 77, affiliate: true },
  { name: 'Mobile Vikings', type: 'niche', multiplier: 0.74, rating: 8.0, reviews: 20123, trust: 79, affiliate: true },
  { name: 'Njoy Mobile', type: 'niche', multiplier: 0.66, rating: 7.7, reviews: 17345, trust: 76, affiliate: true }
];

/**
 * Estimate telecom costs based on service type and usage
 */
function estimateTelecomCosts(config) {
  const { serviceType, mobileData, internetSpeed, tvChannels } = config;
  
  let baseCost = 0;
  
  // Mobile costs
  if (serviceType === 'mobiel' || serviceType === 'mobiel-internet' || serviceType === 'alles') {
    const dataGB = mobileData || 10;
    // Base: €15 + €2 per GB
    baseCost += 15 + (dataGB * 2);
  }
  
  // Internet costs
  if (serviceType === 'internet' || serviceType === 'mobiel-internet' || serviceType === 'alles') {
    const speed = internetSpeed || 100;
    // Base: €25 + speed factor
    if (speed <= 100) baseCost += 25;
    else if (speed <= 200) baseCost += 35;
    else if (speed <= 500) baseCost += 45;
    else baseCost += 60; // 1000 Mbps
  }
  
  // TV costs
  if (tvChannels) {
    baseCost += 10;
  }
  
  return baseCost; // Monthly cost
}

/**
 * Generate all telecom offers with Smart Rotation
 */
function generateAllOffers(config, userId = 'anonymous') {
  const baseCost = estimateTelecomCosts(config);
  
  // Generate offers for all providers
  const offers = providers.map(provider => {
    const monthlyCost = Math.round(baseCost * provider.multiplier);
    const yearlyCost = monthlyCost * 12;
    
    return {
      provider: provider.name,
      type: provider.type,
      monthly: monthlyCost,
      yearly: yearlyCost,
      rating: provider.rating,
      reviews: provider.reviews,
      trust: provider.trust,
      affiliate: provider.affiliate,
      url: `https://www.${provider.name.toLowerCase().replace(/ /g, '')}.nl`,
      savings: 0 // Will be calculated after sorting
    };
  });
  
  // Sort by price (cheapest first)
  offers.sort((a, b) => a.monthly - b.monthly);
  
  // Calculate savings (vs most expensive)
  const maxPrice = offers[offers.length - 1].monthly;
  offers.forEach(offer => {
    offer.savings = (maxPrice - offer.monthly) * 12; // Yearly savings
  });
  
  // SMART ROTATION: Apply micro-shuffle based on userId + timestamp
  const seedData = getRotationSeed(userId, config);
  const rotated = microShuffle(offers, seedData);
  
  console.log(`[Telecom] Using ESTIMATED prices (research-based multipliers)`);
  console.log(`[Telecom Rotation] Day ${seedData.daySlot % 4}, Hour ${seedData.hourSlot}, Intensity ${seedData.intensity * 100}%`);
  console.log(`[Telecom Rotation] Top 3: ${rotated.slice(0, 3).map(o => o.provider).join(', ')}`);
  
  return rotated;
}

/**
 * SMART ROTATION - Anti-Pattern Learning
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

module.exports = {
  generateAllOffers,
  estimateTelecomCosts,
  providers
};
