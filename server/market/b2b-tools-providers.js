/**
 * B2B TOOLS PROVIDERS - Industrial Tools & Equipment
 * 15 leveranciers (3 giganten + 12 niszowych)
 */

const { calculatePrice, generateTieredPricing, applySmartRotation, generateRFQ, getApprovalWorkflow } = require('./b2b-pricing-engine');

const providers = [
  { name: 'Hilti', type: 'giant', multiplier: 1.15, rating: 9.1, reviews: 4567, trust: 94, minOrder: 1 },
  { name: 'Makita', type: 'giant', multiplier: 1.12, rating: 9.0, reviews: 4321, trust: 93, minOrder: 1 },
  { name: 'DeWalt', type: 'giant', multiplier: 1.10, rating: 8.9, reviews: 4098, trust: 92, minOrder: 1 },
  { name: 'Bosch Professional', type: 'niche', multiplier: 0.91, rating: 8.8, reviews: 3765, trust: 91, minOrder: 1 },
  { name: 'Milwaukee', type: 'niche', multiplier: 0.88, rating: 8.7, reviews: 3543, trust: 90, minOrder: 1 },
  { name: 'Festool', type: 'niche', multiplier: 0.85, rating: 8.6, reviews: 3321, trust: 89, minOrder: 1 },
  { name: 'Metabo', type: 'niche', multiplier: 0.89, rating: 8.5, reviews: 3098, trust: 88, minOrder: 1 },
  { name: 'Stanley', type: 'niche', multiplier: 0.86, rating: 8.4, reviews: 2876, trust: 87, minOrder: 1 },
  { name: 'Würth', type: 'niche', multiplier: 0.84, rating: 8.3, reviews: 2654, trust: 86, minOrder: 10 },
  { name: 'Gedore', type: 'niche', multiplier: 0.90, rating: 8.2, reviews: 2432, trust: 85, minOrder: 1 },
  { name: 'Facom', type: 'niche', multiplier: 0.87, rating: 8.1, reviews: 2210, trust: 84, minOrder: 1 },
  { name: 'Snap-on', type: 'niche', multiplier: 0.83, rating: 8.0, reviews: 1987, trust: 83, minOrder: 1 },
  { name: 'Bahco', type: 'niche', multiplier: 0.88, rating: 7.9, reviews: 1765, trust: 82, minOrder: 1 },
  { name: 'Knipex', type: 'niche', multiplier: 0.85, rating: 7.8, reviews: 1543, trust: 81, minOrder: 1 },
  { name: 'Wera', type: 'niche', multiplier: 0.82, rating: 7.7, reviews: 1321, trust: 80, minOrder: 1 }
];

const BASE_PRICES = {
  'drill': 285,           // €/unit
  'saw': 420,             // €/unit
  'grinder': 195,         // €/unit
  'wrench': 45,           // €/unit
  'screwdriver': 35,      // €/unit
  'hammer': 55,           // €/unit
  'toolset': 850          // €/set
};

function estimateToolsPrice(config) {
  const { toolType, brand } = config;
  return BASE_PRICES[toolType] || BASE_PRICES['drill'];
}

function generateAllOffers(config, userId = 'anonymous') {
  const { quantity, paymentTerms, urgency } = config;
  const basePrice = estimateToolsPrice(config);
  
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
      deliveryTime: urgency === 'urgent' ? '2 days' : urgency === 'express' ? '5 days' : '10 days'
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
  const basePrice = estimateToolsPrice(config);
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

module.exports = { providers, BASE_PRICES, estimateToolsPrice, generateAllOffers, generateQuotePackage };
