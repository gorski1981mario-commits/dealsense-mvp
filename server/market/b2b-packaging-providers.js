/**
 * B2B PACKAGING PROVIDERS
 * 14 leveranciers (2 giganten + 12 niszowych)
 */

const { calculatePrice, generateTieredPricing, applySmartRotation, generateRFQ, getApprovalWorkflow } = require('./b2b-pricing-engine');

const providers = [
  { name: 'DS Smith', type: 'giant', multiplier: 1.10, rating: 8.8, reviews: 2987, trust: 92, minOrder: 500 },
  { name: 'Smurfit Kappa', type: 'giant', multiplier: 1.12, rating: 8.7, reviews: 2765, trust: 91, minOrder: 1000 },
  { name: 'Van Genechten', type: 'niche', multiplier: 0.88, rating: 8.6, reviews: 2543, trust: 90, minOrder: 250 },
  { name: 'Packservice', type: 'niche', multiplier: 0.85, rating: 8.5, reviews: 2321, trust: 89, minOrder: 100 },
  { name: 'Rajapack', type: 'niche', multiplier: 0.90, rating: 8.4, reviews: 2098, trust: 88, minOrder: 50 },
  { name: 'Antalis', type: 'niche', multiplier: 0.87, rating: 8.3, reviews: 1876, trust: 87, minOrder: 250 },
  { name: 'Packaging2Buy', type: 'niche', multiplier: 0.84, rating: 8.2, reviews: 1654, trust: 86, minOrder: 100 },
  { name: 'Verpakkingswebshop', type: 'niche', multiplier: 0.89, rating: 8.1, reviews: 1432, trust: 85, minOrder: 50 },
  { name: 'Boxon', type: 'niche', multiplier: 0.86, rating: 8.0, reviews: 1210, trust: 84, minOrder: 250 },
  { name: 'Packhelp', type: 'niche', multiplier: 0.83, rating: 7.9, reviews: 987, trust: 83, minOrder: 100 },
  { name: 'Kartonnen Dozen', type: 'niche', multiplier: 0.91, rating: 7.8, reviews: 765, trust: 82, minOrder: 50 },
  { name: 'Palletcentrale', type: 'niche', multiplier: 0.85, rating: 7.7, reviews: 543, trust: 81, minOrder: 500 },
  { name: 'Stretch Film Direct', type: 'niche', multiplier: 0.82, rating: 7.6, reviews: 432, trust: 80, minOrder: 100 },
  { name: 'Packaging Supplies', type: 'niche', multiplier: 0.88, rating: 7.5, reviews: 321, trust: 79, minOrder: 50 }
];

const BASE_PRICES = {
  'boxes': 0.85,          // €/unit
  'pallets': 12.50,       // €/unit
  'film': 45.00,          // €/roll
  'tape': 2.20,           // €/roll
  'bubble': 35.00,        // €/roll
  'labels': 0.15,         // €/unit
  'bags': 0.25            // €/unit
};

function estimatePackagingPrice(config) {
  const { packagingType, material } = config;
  return BASE_PRICES[packagingType] || BASE_PRICES['boxes'];
}

function generateAllOffers(config, userId = 'anonymous') {
  const { quantity, paymentTerms, urgency } = config;
  const basePrice = estimatePackagingPrice(config);
  
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
  const basePrice = estimatePackagingPrice(config);
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

module.exports = { providers, BASE_PRICES, estimatePackagingPrice, generateAllOffers, generateQuotePackage };
