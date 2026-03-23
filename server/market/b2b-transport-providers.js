/**
 * B2B TRANSPORT & LOGISTICS PROVIDERS
 * 16 leveranciers (3 giganten + 13 niszowych)
 */

const { calculatePrice, generateTieredPricing, applySmartRotation, generateRFQ, getApprovalWorkflow } = require('./b2b-pricing-engine');

const providers = [
  { name: 'DHL Freight', type: 'giant', multiplier: 1.12, rating: 9.0, reviews: 5678, trust: 94, minOrder: 1 },
  { name: 'DB Schenker', type: 'giant', multiplier: 1.10, rating: 8.9, reviews: 5432, trust: 93, minOrder: 1 },
  { name: 'Kuehne + Nagel', type: 'giant', multiplier: 1.15, rating: 8.8, reviews: 5234, trust: 92, minOrder: 1 },
  { name: 'DSV', type: 'niche', multiplier: 0.89, rating: 8.7, reviews: 4567, trust: 91, minOrder: 1 },
  { name: 'Geodis', type: 'niche', multiplier: 0.86, rating: 8.6, reviews: 4321, trust: 90, minOrder: 1 },
  { name: 'Rhenus Logistics', type: 'niche', multiplier: 0.84, rating: 8.5, reviews: 4098, trust: 89, minOrder: 1 },
  { name: 'Dachser', type: 'niche', multiplier: 0.87, rating: 8.4, reviews: 3876, trust: 88, minOrder: 1 },
  { name: 'Panalpina', type: 'niche', multiplier: 0.83, rating: 8.3, reviews: 3654, trust: 87, minOrder: 1 },
  { name: 'Ceva Logistics', type: 'niche', multiplier: 0.88, rating: 8.2, reviews: 3432, trust: 86, minOrder: 1 },
  { name: 'XPO Logistics', type: 'niche', multiplier: 0.85, rating: 8.1, reviews: 3210, trust: 85, minOrder: 1 },
  { name: 'Nippon Express', type: 'niche', multiplier: 0.82, rating: 8.0, reviews: 2987, trust: 84, minOrder: 1 },
  { name: 'Agility Logistics', type: 'niche', multiplier: 0.90, rating: 7.9, reviews: 2765, trust: 83, minOrder: 1 },
  { name: 'Hellmann Worldwide', type: 'niche', multiplier: 0.86, rating: 7.8, reviews: 2543, trust: 82, minOrder: 1 },
  { name: 'Expeditors', type: 'niche', multiplier: 0.84, rating: 7.7, reviews: 2321, trust: 81, minOrder: 1 },
  { name: 'Bolloré Logistics', type: 'niche', multiplier: 0.91, rating: 7.6, reviews: 2098, trust: 80, minOrder: 1 },
  { name: 'Mainfreight', type: 'niche', multiplier: 0.87, rating: 7.5, reviews: 1876, trust: 79, minOrder: 1 }
];

const BASE_PRICES = {
  'road': 1.85,           // €/km
  'rail': 0.95,           // €/km
  'sea': 850,             // €/container
  'air': 4.50,            // €/kg
  'intermodal': 1200,     // €/shipment
  'warehousing': 8.50     // €/pallet/day
};

function estimateTransportPrice(config) {
  const { transportType, distance, weight } = config;
  let basePrice = BASE_PRICES[transportType] || BASE_PRICES['road'];
  
  if (transportType === 'road' || transportType === 'rail') {
    return basePrice * (distance || 100);
  } else if (transportType === 'air') {
    return basePrice * (weight || 100);
  }
  
  return basePrice;
}

function generateAllOffers(config, userId = 'anonymous') {
  const { quantity, paymentTerms, urgency } = config;
  const basePrice = estimateTransportPrice(config);
  
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
      deliveryTime: urgency === 'urgent' ? '24h' : urgency === 'express' ? '48h' : '5-7 days'
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
  const basePrice = estimateTransportPrice(config);
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

module.exports = { providers, BASE_PRICES, estimateTransportPrice, generateAllOffers, generateQuotePackage };
