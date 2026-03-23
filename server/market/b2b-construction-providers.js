/**
 * B2B CONSTRUCTION MATERIALS PROVIDERS
 * 15 leveranciers (3 giganten + 12 niszowych)
 */

const { calculatePrice, generateTieredPricing, applySmartRotation, generateRFQ, getApprovalWorkflow } = require('./b2b-pricing-engine');

const providers = [
  { name: 'HeidelbergCement', type: 'giant', multiplier: 1.10, rating: 9.0, reviews: 3456, trust: 94, minOrder: 50 },
  { name: 'CRH Nederland', type: 'giant', multiplier: 1.12, rating: 8.9, reviews: 3234, trust: 93, minOrder: 100 },
  { name: 'Holcim', type: 'giant', multiplier: 1.08, rating: 8.8, reviews: 3012, trust: 92, minOrder: 75 },
  { name: 'Bouwmaat', type: 'niche', multiplier: 0.88, rating: 8.7, reviews: 2789, trust: 90, minOrder: 10 },
  { name: 'Raab Karcher', type: 'niche', multiplier: 0.85, rating: 8.6, reviews: 2567, trust: 89, minOrder: 25 },
  { name: 'Hornbach Pro', type: 'niche', multiplier: 0.90, rating: 8.5, reviews: 2345, trust: 88, minOrder: 10 },
  { name: 'Gamma Zakelijk', type: 'niche', multiplier: 0.87, rating: 8.4, reviews: 2123, trust: 87, minOrder: 5 },
  { name: 'Praxis Bouwmarkt', type: 'niche', multiplier: 0.84, rating: 8.3, reviews: 1987, trust: 86, minOrder: 10 },
  { name: 'Intergamma', type: 'niche', multiplier: 0.89, rating: 8.2, reviews: 1865, trust: 85, minOrder: 25 },
  { name: 'Bouwcenter', type: 'niche', multiplier: 0.86, rating: 8.1, reviews: 1743, trust: 84, minOrder: 10 },
  { name: 'Timmerfabriek', type: 'niche', multiplier: 0.83, rating: 8.0, reviews: 1621, trust: 83, minOrder: 5 },
  { name: 'Bouwmaterialen NL', type: 'niche', multiplier: 0.91, rating: 7.9, reviews: 1498, trust: 82, minOrder: 25 },
  { name: 'Cement Direct', type: 'niche', multiplier: 0.82, rating: 7.8, reviews: 1376, trust: 81, minOrder: 50 },
  { name: 'Aggregates Plus', type: 'niche', multiplier: 0.88, rating: 7.7, reviews: 1254, trust: 80, minOrder: 100 },
  { name: 'Building Supply Co', type: 'niche', multiplier: 0.85, rating: 7.6, reviews: 1132, trust: 79, minOrder: 10 }
];

const BASE_PRICES = {
  'cement': 120,      // €/ton
  'concrete': 95,     // €/m³
  'aggregates': 25,   // €/ton
  'sand': 18,         // €/ton
  'gravel': 22,       // €/ton
  'bricks': 450,      // €/1000 units
  'timber': 380       // €/m³
};

function estimateConstructionPrice(config) {
  const { material, grade, quantity } = config;
  return BASE_PRICES[material] || BASE_PRICES['cement'];
}

function generateAllOffers(config, userId = 'anonymous') {
  const { quantity, paymentTerms, urgency } = config;
  const basePrice = estimateConstructionPrice(config);
  
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
  const basePrice = estimateConstructionPrice(config);
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

module.exports = { providers, BASE_PRICES, estimateConstructionPrice, generateAllOffers, generateQuotePackage };
