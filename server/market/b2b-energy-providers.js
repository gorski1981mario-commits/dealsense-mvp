/**
 * B2B ENERGY PROVIDERS - Industrial Energy Contracts
 * 14 leveranciers (3 giganten + 11 niszowych)
 */

const { calculatePrice, generateTieredPricing, applySmartRotation, generateRFQ, getApprovalWorkflow } = require('./b2b-pricing-engine');

const providers = [
  { name: 'Eneco Zakelijk', type: 'giant', multiplier: 1.08, rating: 8.9, reviews: 4567, trust: 93, minOrder: 100000 },
  { name: 'Vattenfall Business', type: 'giant', multiplier: 1.10, rating: 8.8, reviews: 4321, trust: 92, minOrder: 150000 },
  { name: 'Essent Zakelijk', type: 'giant', multiplier: 1.12, rating: 8.7, reviews: 4098, trust: 91, minOrder: 100000 },
  { name: 'Greenchoice Zakelijk', type: 'niche', multiplier: 0.89, rating: 8.6, reviews: 3456, trust: 90, minOrder: 50000 },
  { name: 'Budget Energie', type: 'niche', multiplier: 0.86, rating: 8.5, reviews: 3234, trust: 89, minOrder: 25000 },
  { name: 'Vandebron Zakelijk', type: 'niche', multiplier: 0.84, rating: 8.4, reviews: 3012, trust: 88, minOrder: 50000 },
  { name: 'Pure Energie', type: 'niche', multiplier: 0.87, rating: 8.3, reviews: 2789, trust: 87, minOrder: 25000 },
  { name: 'Energiedirect.nl', type: 'niche', multiplier: 0.83, rating: 8.2, reviews: 2567, trust: 86, minOrder: 10000 },
  { name: 'DELTA Zakelijk', type: 'niche', multiplier: 0.88, rating: 8.1, reviews: 2345, trust: 85, minOrder: 50000 },
  { name: 'Innova Energie', type: 'niche', multiplier: 0.85, rating: 8.0, reviews: 2123, trust: 84, minOrder: 25000 },
  { name: 'Powerhouse', type: 'niche', multiplier: 0.82, rating: 7.9, reviews: 1987, trust: 83, minOrder: 10000 },
  { name: 'Energie VanOns', type: 'niche', multiplier: 0.90, rating: 7.8, reviews: 1765, trust: 82, minOrder: 50000 },
  { name: 'Qurrent Zakelijk', type: 'niche', multiplier: 0.86, rating: 7.7, reviews: 1543, trust: 81, minOrder: 25000 },
  { name: 'All-Energy', type: 'niche', multiplier: 0.84, rating: 7.6, reviews: 1321, trust: 80, minOrder: 10000 }
];

const BASE_PRICES = {
  'electricity': 0.25,    // €/kWh
  'gas': 1.20,            // €/m³
  'combined': 0.22        // €/kWh (combined contract discount)
};

function estimateEnergyPrice(config) {
  const { energyType, consumption, contractLength } = config;
  let basePrice = BASE_PRICES[energyType] || BASE_PRICES['electricity'];
  
  // Contract length discounts
  const contractMultipliers = {
    '1year': 1.0,
    '3year': 0.92,
    '5year': 0.85
  };
  
  basePrice *= (contractMultipliers[contractLength] || 1.0);
  return basePrice;
}

function generateAllOffers(config, userId = 'anonymous') {
  const { consumption, paymentTerms, urgency } = config;
  const basePrice = estimateEnergyPrice(config);
  
  const offers = providers.map(provider => {
    const providerBasePrice = basePrice * provider.multiplier;
    const unitPrice = calculatePrice(providerBasePrice, consumption, paymentTerms, urgency);
    const totalPrice = unitPrice * consumption;
    
    return {
      provider: provider.name,
      type: provider.type,
      unitPrice,
      totalPrice,
      consumption,
      rating: provider.rating,
      reviews: provider.reviews,
      trust: provider.trust,
      minOrder: provider.minOrder,
      meetsMinOrder: consumption >= provider.minOrder,
      savings: 0,
      contractStart: 'Immediate'
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
  const basePrice = estimateEnergyPrice(config);
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

module.exports = { providers, BASE_PRICES, estimateEnergyPrice, generateAllOffers, generateQuotePackage };
