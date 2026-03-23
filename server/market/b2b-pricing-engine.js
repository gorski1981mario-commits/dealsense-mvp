/**
 * B2B PRICING ENGINE - Universal for All B2B Configurators
 * 
 * ⚠️ ESTIMATED PRICES (research-based multipliers)
 * 📊 Volume/Tiered Pricing (bulk discounts)
 * 🔄 Smart Rotation (anti-pattern learning)
 * 💰 RFQ System (Request for Quote)
 * 
 * LATER: Real data sources (APIs, scraping)
 */

// VOLUME TIERS (standard for all B2B)
const VOLUME_TIERS = [
  { min: 1, max: 10, discount: 0, label: 'Small order (1-10 units)' },
  { min: 11, max: 50, discount: 0.10, label: 'Medium order (11-50 units)' },
  { min: 51, max: 200, discount: 0.18, label: 'Large order (51-200 units)' },
  { min: 201, max: 999999, discount: 0.25, label: 'Bulk order (201+ units)' }
];

// PAYMENT TERMS DISCOUNTS
const PAYMENT_TERMS = {
  'prepayment': { discount: 0.03, label: 'Prepayment (3% discount)' },
  'net30': { discount: 0, label: 'Net 30 days' },
  'net60': { discount: -0.02, label: 'Net 60 days (+2%)' },
  'net90': { discount: -0.04, label: 'Net 90 days (+4%)' }
};

// URGENCY MULTIPLIERS
const URGENCY_MULTIPLIERS = {
  'standard': { multiplier: 1.0, label: 'Standard (4-6 weeks)', days: 30 },
  'express': { multiplier: 1.15, label: 'Express (2-3 weeks)', days: 14 },
  'urgent': { multiplier: 1.30, label: 'Urgent (1 week)', days: 7 }
};

/**
 * Calculate volume discount tier
 */
function getVolumeTier(quantity) {
  return VOLUME_TIERS.find(tier => quantity >= tier.min && quantity <= tier.max) || VOLUME_TIERS[0];
}

/**
 * Calculate base price with all modifiers
 */
function calculatePrice(basePrice, quantity, paymentTerm = 'net30', urgency = 'standard') {
  const volumeTier = getVolumeTier(quantity);
  const paymentDiscount = PAYMENT_TERMS[paymentTerm]?.discount || 0;
  const urgencyMultiplier = URGENCY_MULTIPLIERS[urgency]?.multiplier || 1.0;
  
  // Apply volume discount first
  let price = basePrice * (1 - volumeTier.discount);
  
  // Apply urgency multiplier
  price = price * urgencyMultiplier;
  
  // Apply payment terms discount/premium
  price = price * (1 + paymentDiscount);
  
  return Math.round(price * 100) / 100;
}

/**
 * Generate tiered pricing table
 */
function generateTieredPricing(basePrice, paymentTerm = 'net30', urgency = 'standard') {
  return VOLUME_TIERS.map(tier => {
    const sampleQty = tier.min;
    const unitPrice = calculatePrice(basePrice, sampleQty, paymentTerm, urgency);
    const totalPrice = unitPrice * sampleQty;
    
    return {
      tier: tier.label,
      minQty: tier.min,
      maxQty: tier.max === 999999 ? '∞' : tier.max,
      discount: `${Math.round(tier.discount * 100)}%`,
      unitPrice: `€${unitPrice.toFixed(2)}`,
      sampleTotal: `€${totalPrice.toFixed(2)} (${sampleQty} units)`
    };
  });
}

/**
 * Smart Rotation for B2B providers
 */
function applySmartRotation(providers, userId = 'anonymous') {
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const daySlot = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const rotationSeed = seed + daySlot;
  
  // Shuffle based on seed
  const shuffled = [...providers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(rotationSeed + i) * 10000) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Generate RFQ (Request for Quote) data
 */
function generateRFQ(config, providers) {
  const { quantity, paymentTerm, urgency } = config;
  
  return {
    rfqId: `RFQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    quantity: quantity,
    paymentTerms: PAYMENT_TERMS[paymentTerm]?.label || 'Net 30 days',
    urgency: URGENCY_MULTIPLIERS[urgency]?.label || 'Standard',
    estimatedDelivery: URGENCY_MULTIPLIERS[urgency]?.days || 30,
    volumeTier: getVolumeTier(quantity),
    providers: providers.slice(0, 5), // Top 5 providers for RFQ
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };
}

/**
 * Generate approval workflow based on order value
 */
function getApprovalWorkflow(totalValue) {
  if (totalValue < 5000) {
    return {
      required: false,
      level: 'auto-approved',
      approvers: [],
      message: 'Order auto-approved (under €5,000)'
    };
  } else if (totalValue < 25000) {
    return {
      required: true,
      level: 'manager',
      approvers: ['Department Manager'],
      message: 'Requires manager approval (€5,000 - €25,000)'
    };
  } else if (totalValue < 100000) {
    return {
      required: true,
      level: 'director',
      approvers: ['Department Manager', 'Finance Director'],
      message: 'Requires director approval (€25,000 - €100,000)'
    };
  } else {
    return {
      required: true,
      level: 'c-level',
      approvers: ['Department Manager', 'Finance Director', 'CFO/CEO'],
      message: 'Requires C-level approval (over €100,000)'
    };
  }
}

module.exports = {
  VOLUME_TIERS,
  PAYMENT_TERMS,
  URGENCY_MULTIPLIERS,
  getVolumeTier,
  calculatePrice,
  generateTieredPricing,
  applySmartRotation,
  generateRFQ,
  getApprovalWorkflow
};
