/**
 * BILLING PLANS
 * Definicje pakietów subskrypcyjnych
 */

const PLANS = {
  free: {
    id: 'free',
    name: 'FREE',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    scansLimit: 3,
    commission: 0.10, // 10%
    features: ['3 scans', 'Basic features']
  },
  plus: {
    id: 'plus',
    name: 'PLUS',
    price: 19.99,
    currency: 'EUR',
    interval: 'month',
    scansLimit: null, // unlimited
    commission: 0.09, // 9%
    features: ['Unlimited scans', 'Ghost Mode 24h', 'Priority support']
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    price: 29.99,
    currency: 'EUR',
    interval: 'month',
    scansLimit: null,
    commission: 0.09, // 9%
    features: ['Unlimited scans', 'Ghost Mode 48h', 'Configurators', 'Echo Auto-fill']
  },
  finance: {
    id: 'finance',
    name: 'FINANCE',
    price: 39.99,
    currency: 'EUR',
    interval: 'month',
    scansLimit: null,
    commission: 0.09, // 9%
    features: ['All PRO features', 'Ghost Mode 7 days', 'Finance configurators']
  }
};

function getPlans() {
  return Object.values(PLANS);
}

function getPlanById(planId) {
  return PLANS[planId] || PLANS.free;
}

module.exports = {
  PLANS,
  getPlans,
  getPlanById
};
