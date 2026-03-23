/**
 * B2B MACHINERY PROVIDERS - Industrial Equipment
 * 13 leveranciers (2 giganten + 11 niszowych)
 */

const { calculatePrice, generateTieredPricing, applySmartRotation, generateRFQ, getApprovalWorkflow } = require('./b2b-pricing-engine');

const providers = [
  { name: 'Bosch Rexroth', type: 'giant', multiplier: 1.18, rating: 9.3, reviews: 3456, trust: 95, minOrder: 1 },
  { name: 'Siemens Industry', type: 'giant', multiplier: 1.15, rating: 9.2, reviews: 3234, trust: 94, minOrder: 1 },
  { name: 'Festo', type: 'niche', multiplier: 0.92, rating: 9.0, reviews: 2987, trust: 92, minOrder: 1 },
  { name: 'SMC Pneumatics', type: 'niche', multiplier: 0.89, rating: 8.9, reviews: 2765, trust: 91, minOrder: 1 },
  { name: 'Parker Hannifin', type: 'niche', multiplier: 0.86, rating: 8.8, reviews: 2543, trust: 90, minOrder: 1 },
  { name: 'Schneider Electric', type: 'niche', multiplier: 0.90, rating: 8.7, reviews: 2321, trust: 89, minOrder: 1 },
  { name: 'ABB Robotics', type: 'niche', multiplier: 0.88, rating: 8.6, reviews: 2098, trust: 88, minOrder: 1 },
  { name: 'KUKA', type: 'niche', multiplier: 0.85, rating: 8.5, reviews: 1876, trust: 87, minOrder: 1 },
  { name: 'Fanuc', type: 'niche', multiplier: 0.91, rating: 8.4, reviews: 1654, trust: 86, minOrder: 1 },
  { name: 'Yaskawa', type: 'niche', multiplier: 0.87, rating: 8.3, reviews: 1432, trust: 85, minOrder: 1 },
  { name: 'Mitsubishi Electric', type: 'niche', multiplier: 0.84, rating: 8.2, reviews: 1210, trust: 84, minOrder: 1 },
  { name: 'Omron', type: 'niche', multiplier: 0.89, rating: 8.1, reviews: 987, trust: 83, minOrder: 1 },
  { name: 'Rockwell Automation', type: 'niche', multiplier: 0.86, rating: 8.0, reviews: 765, trust: 82, minOrder: 1 }
];

const BASE_PRICES = {
  'cnc': 85000,           // €/unit
  'robot': 65000,         // €/unit
  'press': 45000,         // €/unit
  'lathe': 35000,         // €/unit
  'conveyor': 12000,      // €/unit
  'packaging': 28000,     // €/unit
  'welding': 18000        // €/unit
};

function estimateMachineryPrice(config) {
  const { machineType, specifications } = config;
  return BASE_PRICES[machineType] || BASE_PRICES['cnc'];
}

function generateAllOffers(config, userId = 'anonymous') {
  const { quantity, paymentTerms, urgency } = config;
  const basePrice = estimateMachineryPrice(config);
  
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
      deliveryTime: urgency === 'urgent' ? '4 weeks' : urgency === 'express' ? '8 weeks' : '12 weeks'
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
  const basePrice = estimateMachineryPrice(config);
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
    disclaimer: '⚠️ Geschatte prijzen op basis van marktgegevens. Exacte prijzen bij de leverancier.',
    referencePrice: {
      label: 'Referentie (markt gemiddelde)',
      price: offers[offers.length - 1]?.totalPrice || 0
    }
  };
}

module.exports = { providers, BASE_PRICES, estimateMachineryPrice, generateAllOffers, generateQuotePackage };
