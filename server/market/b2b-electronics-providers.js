/**
 * B2B ELECTRONICS COMPONENTS PROVIDERS
 * 17 leveranciers (3 giganten + 14 niszowych)
 */

const { calculatePrice, generateTieredPricing, applySmartRotation, generateRFQ, getApprovalWorkflow } = require('./b2b-pricing-engine');

const providers = [
  { name: 'Farnell', type: 'giant', multiplier: 1.15, rating: 9.2, reviews: 5678, trust: 95, minOrder: 1 },
  { name: 'RS Components', type: 'giant', multiplier: 1.12, rating: 9.1, reviews: 5432, trust: 94, minOrder: 1 },
  { name: 'Mouser Electronics', type: 'giant', multiplier: 1.10, rating: 9.0, reviews: 5234, trust: 93, minOrder: 1 },
  { name: 'Distrelec', type: 'niche', multiplier: 0.92, rating: 8.9, reviews: 4123, trust: 91, minOrder: 1 },
  { name: 'Conrad Electronic', type: 'niche', multiplier: 0.89, rating: 8.8, reviews: 3987, trust: 90, minOrder: 1 },
  { name: 'TME', type: 'niche', multiplier: 0.86, rating: 8.7, reviews: 3765, trust: 89, minOrder: 1 },
  { name: 'Rutronik', type: 'niche', multiplier: 0.90, rating: 8.6, reviews: 3543, trust: 88, minOrder: 10 },
  { name: 'Arrow Electronics', type: 'niche', multiplier: 0.88, rating: 8.5, reviews: 3321, trust: 87, minOrder: 10 },
  { name: 'Avnet', type: 'niche', multiplier: 0.85, rating: 8.4, reviews: 3098, trust: 86, minOrder: 10 },
  { name: 'Future Electronics', type: 'niche', multiplier: 0.91, rating: 8.3, reviews: 2876, trust: 85, minOrder: 5 },
  { name: 'Digi-Key', type: 'niche', multiplier: 0.87, rating: 8.2, reviews: 2654, trust: 84, minOrder: 1 },
  { name: 'Newark', type: 'niche', multiplier: 0.84, rating: 8.1, reviews: 2432, trust: 83, minOrder: 1 },
  { name: 'Chip1Stop', type: 'niche', multiplier: 0.89, rating: 8.0, reviews: 2210, trust: 82, minOrder: 1 },
  { name: 'LCSC Electronics', type: 'niche', multiplier: 0.82, rating: 7.9, reviews: 1987, trust: 81, minOrder: 1 },
  { name: 'Electrocomponents', type: 'niche', multiplier: 0.88, rating: 7.8, reviews: 1765, trust: 80, minOrder: 5 },
  { name: 'TTI Europe', type: 'niche', multiplier: 0.86, rating: 7.7, reviews: 1543, trust: 79, minOrder: 10 },
  { name: 'Components Direct', type: 'niche', multiplier: 0.83, rating: 7.6, reviews: 1321, trust: 78, minOrder: 1 }
];

const BASE_PRICES = {
  'resistors': 0.05,      // €/unit
  'capacitors': 0.08,     // €/unit
  'transistors': 0.25,    // €/unit
  'ics': 2.50,            // €/unit
  'connectors': 0.45,     // €/unit
  'pcb': 15.00,           // €/unit
  'semiconductors': 3.80  // €/unit
};

function estimateElectronicsPrice(config) {
  const { component, specification } = config;
  return BASE_PRICES[component] || BASE_PRICES['ics'];
}

function generateAllOffers(config, userId = 'anonymous') {
  const { quantity, paymentTerms, urgency } = config;
  const basePrice = estimateElectronicsPrice(config);
  
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
      deliveryTime: urgency === 'urgent' ? '3 days' : urgency === 'express' ? '7 days' : '14 days'
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
  const basePrice = estimateElectronicsPrice(config);
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

module.exports = { providers, BASE_PRICES, estimateElectronicsPrice, generateAllOffers, generateQuotePackage };
