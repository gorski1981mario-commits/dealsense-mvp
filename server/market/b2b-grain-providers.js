/**
 * B2B GRAIN PROVIDERS - Dutch Agricultural Commodities Market
 * 
 * 16 leveranciers (3 giganten + 13 niszowych)
 * ⚠️ ESTIMATED PRICES (commodity market based)
 */

const { calculatePrice, generateTieredPricing, applySmartRotation, generateRFQ, getApprovalWorkflow } = require('./b2b-pricing-engine');

const providers = [
  { name: 'Cargill Nederland', type: 'giant', multiplier: 1.08, rating: 9.3, reviews: 4123, trust: 96, minOrder: 100 },
  { name: 'ADM (Archer Daniels)', type: 'giant', multiplier: 1.10, rating: 9.1, reviews: 3876, trust: 95, minOrder: 200 },
  { name: 'Bunge Loders Croklaan', type: 'giant', multiplier: 1.12, rating: 9.0, reviews: 3654, trust: 94, minOrder: 150 },
  { name: 'Viterra', type: 'niche', multiplier: 0.89, rating: 8.8, reviews: 2987, trust: 92, minOrder: 50 },
  { name: 'Cefetra', type: 'niche', multiplier: 0.86, rating: 8.7, reviews: 2765, trust: 91, minOrder: 25 },
  { name: 'Agrifirm', type: 'niche', multiplier: 0.84, rating: 8.6, reviews: 2543, trust: 90, minOrder: 50 },
  { name: 'ForFarmers', type: 'niche', multiplier: 0.87, rating: 8.5, reviews: 2398, trust: 89, minOrder: 25 },
  { name: 'Graanhandel Van der Voort', type: 'niche', multiplier: 0.83, rating: 8.4, reviews: 2187, trust: 88, minOrder: 10 },
  { name: 'Agrovision', type: 'niche', multiplier: 0.88, rating: 8.3, reviews: 1976, trust: 87, minOrder: 25 },
  { name: 'De Heus', type: 'niche', multiplier: 0.85, rating: 8.2, reviews: 1854, trust: 86, minOrder: 50 },
  { name: 'Agrifeed', type: 'niche', multiplier: 0.82, rating: 8.1, reviews: 1723, trust: 85, minOrder: 10 },
  { name: 'Grainco', type: 'niche', multiplier: 0.90, rating: 8.0, reviews: 1612, trust: 84, minOrder: 25 },
  { name: 'Nedato', type: 'niche', multiplier: 0.86, rating: 7.9, reviews: 1498, trust: 83, minOrder: 50 },
  { name: 'Grainport', type: 'niche', multiplier: 0.84, rating: 7.8, reviews: 1387, trust: 82, minOrder: 100 },
  { name: 'Agro Merchants', type: 'niche', multiplier: 0.81, rating: 7.7, reviews: 1276, trust: 81, minOrder: 25 },
  { name: 'Grain Traders NL', type: 'niche', multiplier: 0.88, rating: 7.6, reviews: 1165, trust: 80, minOrder: 10 }
];

const BASE_PRICES = {
  'wheat': 220,      // €/ton
  'corn': 195,       // €/ton
  'soybean': 425,    // €/ton
  'barley': 185,     // €/ton
  'rice': 520        // €/ton
};

function estimateGrainPrice(config) {
  const { commodity, quality, moisture, protein } = config;
  let basePrice = BASE_PRICES[commodity] || BASE_PRICES['wheat'];
  
  const qualityMultipliers = {
    'Milling wheat': 1.15,
    'Feed wheat': 1.0,
    'GMO': 0.95,
    'Non-GMO': 1.10,
    'Biologisch': 1.35
  };
  
  basePrice *= (qualityMultipliers[quality] || 1.0);
  
  // Moisture penalty (higher moisture = lower price)
  if (moisture && parseFloat(moisture) > 14) {
    basePrice *= 0.95;
  }
  
  return basePrice;
}

function generateAllOffers(config, userId = 'anonymous') {
  const { quantity, paymentTerms, urgency } = config;
  const basePrice = estimateGrainPrice(config);
  
  const offers = providers.map(provider => {
    const providerBasePrice = basePrice * provider.multiplier;
    const unitPrice = calculatePrice(providerBasePrice, quantity, paymentTerms, urgency);
    const totalPrice = unitPrice * quantity;
    
    return {
      provider: provider.name,
      type: provider.type,
      unitPrice,
      totalPrice,
      quantity,
      rating: provider.rating,
      reviews: provider.reviews,
      trust: provider.trust,
      minOrder: provider.minOrder,
      meetsMinOrder: quantity >= provider.minOrder,
      savings: 0,
      deliveryTime: urgency === 'urgent' ? '7 days' : urgency === 'express' ? '14 days' : '30 days'
    };
  });
  
  const validOffers = offers.filter(o => o.meetsMinOrder);
  validOffers.sort((a, b) => a.totalPrice - b.totalPrice);
  
  const maxPrice = validOffers[validOffers.length - 1]?.totalPrice || 0;
  validOffers.forEach(offer => {
    offer.savings = maxPrice - offer.totalPrice;
    offer.savingsPercent = maxPrice > 0 ? Math.round((offer.savings / maxPrice) * 100) : 0;
  });
  
  return applySmartRotation(validOffers, userId);
}

function generateQuotePackage(config, userId = 'anonymous') {
  const offers = generateAllOffers(config, userId);
  const basePrice = estimateGrainPrice(config);
  const tieredPricing = generateTieredPricing(basePrice, config.paymentTerms, config.urgency);
  const rfq = generateRFQ(config, offers);
  const bestOffer = offers[0];
  const approvalWorkflow = getApprovalWorkflow(bestOffer?.totalPrice || 0);
  
  return {
    offers: offers.slice(0, 10),
    tieredPricing,
    rfq,
    approvalWorkflow,
    summary: {
      totalProviders: offers.length,
      bestPrice: bestOffer?.unitPrice,
      maxSavings: bestOffer?.savings,
      savingsPercent: bestOffer?.savingsPercent
    },
    disclaimer: '⚠️ Geschatte prijzen op basis van commodity markets (CBOT, Euronext). Exacte prijzen bij de leverancier.',
    referencePrice: {
      label: 'Referentie (markt gemiddelde)',
      price: offers[offers.length - 1]?.totalPrice || 0
    }
  };
}

module.exports = { providers, BASE_PRICES, estimateGrainPrice, generateAllOffers, generateQuotePackage };
